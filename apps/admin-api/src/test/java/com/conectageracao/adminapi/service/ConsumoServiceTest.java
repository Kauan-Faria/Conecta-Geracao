package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.dto.ConsumptionReportLineResponse;
import com.conectageracao.adminapi.dto.ConsumptionResponse;
import com.conectageracao.adminapi.dto.RegisterAlertRequest;
import com.conectageracao.adminapi.dto.RegisterAlertResponse;
import com.conectageracao.adminapi.exception.OracleUnavailableException;
import com.conectageracao.adminapi.exception.ResourceNotFoundException;
import com.conectageracao.adminapi.exception.ValidationException;
import oracle.jdbc.OracleTypes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsumoServiceTest {

    private static final LocalDateTime INICIO = LocalDateTime.of(2026, 9, 1, 0, 0, 0);
    private static final LocalDateTime FIM = LocalDateTime.of(2026, 9, 30, 23, 59, 59);

    @Mock
    private OracleConsumoAccess oracle;

    @Mock
    private JdbcTemplate jdbc;

    @Mock
    private Connection connection;

    @Mock
    private CallableStatement call;

    @Mock
    private ResultSet cursor;

    private ConsumoService service;

    @BeforeEach
    void setUp() {
        service = new ConsumoService(oracle);
    }

    @Test
    void periodoInvertidoNaoChamaOracle() {
        assertThrows(ValidationException.class, () -> service.consult(1L, FIM, INICIO));
        verify(oracle, never()).require();
    }

    @Test
    void usuarioInvalidoNaoChamaOracle() {
        assertThrows(ValidationException.class, () -> service.consult(0L, INICIO, FIM));
        verify(oracle, never()).require();
    }

    @Test
    void limiteNegativoNaoChamaProcedure() {
        RegisterAlertRequest request = new RegisterAlertRequest(1L, INICIO, FIM, -1L);
        assertThrows(ValidationException.class, () -> service.registerAlert(request));
        verify(oracle, never()).require();
    }

    @Test
    void usuarioInexistenteVira404() {
        when(oracle.require()).thenReturn(jdbc);
        when(jdbc.queryForObject(contains("FN_INDICADOR_TOKENS"), eq(BigDecimal.class), any(), any(), any()))
                .thenThrow(sql(20001));

        assertThrows(ResourceNotFoundException.class, () -> service.consult(999999L, INICIO, FIM));
    }

    @Test
    void periodoRecusadoPeloBancoVira400() {
        when(oracle.require()).thenReturn(jdbc);
        when(jdbc.queryForObject(contains("FN_INDICADOR_TOKENS"), eq(BigDecimal.class), any(), any(), any()))
                .thenThrow(sql(20002));

        assertThrows(ValidationException.class, () -> service.consult(1L, INICIO, FIM));
    }

    @Test
    void falhaDeConexaoViraOracleIndisponivel() {
        when(oracle.require()).thenReturn(jdbc);
        when(jdbc.queryForObject(contains("FN_INDICADOR_TOKENS"), eq(BigDecimal.class), any(), any(), any()))
                .thenThrow(sql(17002));

        OracleUnavailableException ex = assertThrows(
                OracleUnavailableException.class,
                () -> service.consult(1L, INICIO, FIM)
        );
        assertEquals(OracleConsumoAccess.UNAVAILABLE, ex.getMessage());
    }

    @Test
    void consultaMontaIndicadorTextoERelatorio() throws Exception {
        when(oracle.require()).thenReturn(jdbc);
        when(jdbc.queryForObject(contains("FN_INDICADOR_TOKENS"), eq(BigDecimal.class), any(), any(), any()))
                .thenReturn(new BigDecimal("3500"));
        when(jdbc.queryForObject(contains("FN_CONSUMO_FORMATADO"), eq(String.class), any(), any(), any()))
                .thenReturn("Ana Clara consumiu 3500 tokens no período. Consumo normal.");
        when(jdbc.query(anyString(), anyMapper(), any(), any(), any())).thenReturn(List.of());
        when(connection.prepareCall(anyString())).thenReturn(call);
        when(call.getObject(3)).thenReturn(cursor);
        when(cursor.next()).thenReturn(true, false);
        when(cursor.getLong("USUARIO_ID")).thenReturn(1L);
        when(cursor.getString("NOME")).thenReturn("Ana Clara");
        when(cursor.getLong("TOTAL_TOKENS")).thenReturn(3500L);
        when(cursor.getInt("TEM_ALERTA")).thenReturn(0);
        when(jdbc.execute(anyCallback())).thenAnswer(invocation -> {
            ConnectionCallback<?> callback = invocation.getArgument(0);
            return callback.doInConnection(connection);
        });

        ConsumptionResponse response = service.consult(1L, INICIO, FIM);

        assertEquals(3500L, response.tokenTotal());
        assertEquals("Ana Clara consumiu 3500 tokens no período. Consumo normal.", response.formattedText());
        assertTrue(response.alerts().isEmpty());
        assertEquals(1, response.report().size());
        assertFalse(response.report().get(0).hasAlert());
        verify(connection).prepareCall("{ call PR_RELATORIO_CONSUMO(?, ?, ?) }");
        verify(call).registerOutParameter(3, OracleTypes.CURSOR);
    }

    @Test
    void disparoUsaCallableStatementEDevolveId() throws Exception {
        when(oracle.require()).thenReturn(jdbc);
        when(connection.prepareCall(anyString())).thenReturn(call);
        when(call.getLong(5)).thenReturn(7L);
        when(call.wasNull()).thenReturn(false);
        when(jdbc.execute(anyCallback())).thenAnswer(invocation -> {
            ConnectionCallback<?> callback = invocation.getArgument(0);
            return callback.doInConnection(connection);
        });

        RegisterAlertResponse response = service.registerAlert(new RegisterAlertRequest(2L, INICIO, FIM, null));

        assertEquals(7L, response.alertId());
        assertTrue(response.recorded());
        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(connection).prepareCall(sql.capture());
        assertEquals("{ call PR_REGISTRAR_ALERTA_CONSUMO(?, ?, ?, ?, ?) }", sql.getValue());
        verify(call).setLong(1, 2L);
        verify(call).setLong(4, 10_000L);
        verify(call).registerOutParameter(5, Types.NUMERIC);
    }

    @Test
    void disparoAbaixoDoLimiteNaoMarcaGravado() throws Exception {
        when(oracle.require()).thenReturn(jdbc);
        when(connection.prepareCall(anyString())).thenReturn(call);
        when(call.getLong(5)).thenReturn(0L);
        when(call.wasNull()).thenReturn(true);
        when(jdbc.execute(anyCallback())).thenAnswer(invocation -> {
            ConnectionCallback<?> callback = invocation.getArgument(0);
            return callback.doInConnection(connection);
        });

        RegisterAlertResponse response = service.registerAlert(new RegisterAlertRequest(1L, INICIO, FIM, 10000L));

        assertNull(response.alertId());
        assertFalse(response.recorded());
    }

    private static DataAccessException sql(int code) {
        return new DataAccessException("consulta", new SQLException("ora", "72000", code)) {
        };
    }

    @SuppressWarnings("unchecked")
    private static RowMapper<ConsumptionReportLineResponse> anyMapper() {
        return any(RowMapper.class);
    }

    @SuppressWarnings("unchecked")
    private static ConnectionCallback<Object> anyCallback() {
        return any(ConnectionCallback.class);
    }
}
