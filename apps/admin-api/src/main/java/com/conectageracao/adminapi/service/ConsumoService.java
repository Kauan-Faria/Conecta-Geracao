package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.dto.ConsumptionAlertResponse;
import com.conectageracao.adminapi.dto.ConsumptionReportLineResponse;
import com.conectageracao.adminapi.dto.ConsumptionResponse;
import com.conectageracao.adminapi.dto.RegisterAlertRequest;
import com.conectageracao.adminapi.dto.RegisterAlertResponse;
import com.conectageracao.adminapi.exception.OracleUnavailableException;
import com.conectageracao.adminapi.exception.ResourceNotFoundException;
import com.conectageracao.adminapi.exception.ValidationException;
import oracle.jdbc.OracleTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConsumoService {

    private static final Logger log = LoggerFactory.getLogger(ConsumoService.class);
    private static final long DEFAULT_LIMIT = 10_000L;

    private static final String SQL_INDICADOR =
            "SELECT FN_INDICADOR_TOKENS(?, ?, ?) FROM DUAL";
    private static final String SQL_FORMATADO =
            "SELECT FN_CONSUMO_FORMATADO(?, ?, ?) FROM DUAL";
    private static final String SQL_ALERTAS = """
            SELECT id, usuario_id, inicio, fim, total_tokens, mensagem, criado_em
              FROM alerta_consumo
             WHERE usuario_id = ?
               AND inicio = ?
               AND fim = ?
             ORDER BY id
            """;
    private static final String CALL_ALERTA =
            "{ call PR_REGISTRAR_ALERTA_CONSUMO(?, ?, ?, ?, ?) }";
    private static final String CALL_RELATORIO =
            "{ call PR_RELATORIO_CONSUMO(?, ?, ?) }";

    private final OracleConsumoAccess oracle;

    public ConsumoService(OracleConsumoAccess oracle) {
        this.oracle = oracle;
    }

    public ConsumptionResponse consult(Long userId, LocalDateTime periodStart, LocalDateTime periodEnd) {
        requirePeriod(periodStart, periodEnd);
        requireUser(userId);
        try {
            JdbcTemplate jdbc = oracle.require();
            Timestamp start = Timestamp.valueOf(periodStart);
            Timestamp end = Timestamp.valueOf(periodEnd);
            Long total = toLong(jdbc.queryForObject(SQL_INDICADOR, BigDecimal.class, userId, start, end));
            String text = jdbc.queryForObject(SQL_FORMATADO, String.class, userId, start, end);
            List<ConsumptionAlertResponse> alerts = jdbc.query(SQL_ALERTAS, (rs, rowNum) -> mapAlert(rs), userId, start, end);
            List<ConsumptionReportLineResponse> report = report(jdbc, start, end);
            return new ConsumptionResponse(userId, periodStart, periodEnd, total, text, alerts, report);
        } catch (DataAccessException ex) {
            throw translate(ex);
        }
    }

    public RegisterAlertResponse registerAlert(RegisterAlertRequest request) {
        requirePeriod(request.periodStart(), request.periodEnd());
        requireUser(request.userId());
        if (request.limit() != null && request.limit() < 0) {
            throw new ValidationException("Limite de consumo inválido.");
        }
        long limit = request.limit() == null ? DEFAULT_LIMIT : request.limit();
        try {
            JdbcTemplate jdbc = oracle.require();
            Long alertId = jdbc.execute((Connection connection) -> callAlert(connection, request, limit));
            return new RegisterAlertResponse(alertId, alertId != null);
        } catch (DataAccessException ex) {
            throw translate(ex);
        }
    }

    private Long callAlert(Connection connection, RegisterAlertRequest request, long limit) throws SQLException {
        try (CallableStatement call = connection.prepareCall(CALL_ALERTA)) {
            call.setLong(1, request.userId());
            call.setTimestamp(2, Timestamp.valueOf(request.periodStart()));
            call.setTimestamp(3, Timestamp.valueOf(request.periodEnd()));
            call.setLong(4, limit);
            call.registerOutParameter(5, Types.NUMERIC);
            call.execute();
            long id = call.getLong(5);
            if (call.wasNull()) {
                return null;
            }
            return id;
        }
    }

    private List<ConsumptionReportLineResponse> report(JdbcTemplate jdbc, Timestamp start, Timestamp end) {
        List<ConsumptionReportLineResponse> rows = jdbc.execute((Connection connection) -> {
            try (CallableStatement call = connection.prepareCall(CALL_RELATORIO)) {
                call.setTimestamp(1, start);
                call.setTimestamp(2, end);
                call.registerOutParameter(3, OracleTypes.CURSOR);
                call.execute();
                try (ResultSet cursor = (ResultSet) call.getObject(3)) {
                    List<ConsumptionReportLineResponse> lines = new ArrayList<>();
                    while (cursor != null && cursor.next()) {
                        lines.add(new ConsumptionReportLineResponse(
                                cursor.getLong("USUARIO_ID"),
                                cursor.getString("NOME"),
                                cursor.getLong("TOTAL_TOKENS"),
                                cursor.getInt("TEM_ALERTA") == 1
                        ));
                    }
                    return lines;
                }
            }
        });
        return rows == null ? List.of() : rows;
    }

    private ConsumptionAlertResponse mapAlert(ResultSet rs) throws SQLException {
        return new ConsumptionAlertResponse(
                rs.getLong("ID"),
                rs.getLong("USUARIO_ID"),
                toLocal(rs.getTimestamp("INICIO")),
                toLocal(rs.getTimestamp("FIM")),
                rs.getLong("TOTAL_TOKENS"),
                rs.getString("MENSAGEM"),
                toLocal(rs.getTimestamp("CRIADO_EM"))
        );
    }

    private static LocalDateTime toLocal(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private static Long toLong(BigDecimal value) {
        return value == null ? null : value.longValue();
    }

    private static void requireUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new ValidationException("Usuário de consumo inválido.");
        }
    }

    private static void requirePeriod(LocalDateTime periodStart, LocalDateTime periodEnd) {
        if (periodStart == null || periodEnd == null || periodStart.isAfter(periodEnd)) {
            throw new ValidationException("Período inválido: início posterior ao fim.");
        }
    }

    private RuntimeException translate(DataAccessException ex) {
        SQLException sql = findSql(ex);
        if (sql != null) {
            int code = Math.abs(sql.getErrorCode());
            if (code == 20001) {
                return new ResourceNotFoundException("Usuário de consumo inexistente.");
            }
            if (code == 20002) {
                return new ValidationException("Período inválido: início posterior ao fim.");
            }
            if (code == 20003) {
                return new ValidationException("Limite de consumo inválido.");
            }
        }
        log.warn("Falha ao falar com o Oracle de consumo", ex);
        return new OracleUnavailableException(OracleConsumoAccess.UNAVAILABLE, ex);
    }

    private static SQLException findSql(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof SQLException sql && sql.getErrorCode() != 0) {
                return sql;
            }
            current = current.getCause();
        }
        current = ex;
        while (current != null) {
            if (current instanceof SQLException sql) {
                return sql;
            }
            current = current.getCause();
        }
        return null;
    }
}
