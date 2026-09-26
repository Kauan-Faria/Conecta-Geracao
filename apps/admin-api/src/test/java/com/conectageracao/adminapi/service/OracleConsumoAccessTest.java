package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.exception.OracleUnavailableException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OracleConsumoAccessTest {

    @Test
    void semUrlAApiNaoAbrePool() {
        OracleConsumoAccess access = new OracleConsumoAccess("", "conecta", "secreta");

        OracleUnavailableException ex = assertThrows(OracleUnavailableException.class, access::require);

        assertEquals(OracleConsumoAccess.UNAVAILABLE, ex.getMessage());
    }

    @Test
    void semUsuarioTambemRecusaNaChamada() {
        OracleConsumoAccess access = new OracleConsumoAccess("jdbc:oracle:thin:@//localhost/FREEPDB1", "  ", "");

        assertThrows(OracleUnavailableException.class, access::require);
    }
}
