package com.conectageracao.adminapi;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OracleScriptGuardTest {

    @Test
    void scriptsNaoGravamSegredoNemConnectString() throws IOException {
        Path dir = Path.of("src/main/resources/db/oracle");
        try (Stream<Path> files = Files.list(dir)) {
            files.filter(path -> {
                String name = path.getFileName().toString();
                return name.endsWith(".sql") || name.endsWith(".md");
            }).forEach(path -> {
                String text;
                try {
                    text = Files.readString(path).toUpperCase();
                } catch (IOException ex) {
                    throw new IllegalStateException(path.toString(), ex);
                }
                assertFalse(text.contains("IDENTIFIED BY"), path.toString());
                assertFalse(text.contains("CONNECT "), path.toString());
                assertFalse(text.contains("JDBC:ORACLE:THIN"), path.toString());
            });
        }
    }

    @Test
    void packageTriggerESqlDinamicoEstaoNoScript009() throws IOException {
        String text = Files.readString(Path.of("src/main/resources/db/oracle/009_pkg_consumo_ia.sql")).toUpperCase();
        assertTrue(text.contains("CREATE OR REPLACE PACKAGE PKG_CONSUMO_IA"));
        assertTrue(text.contains("CREATE OR REPLACE TRIGGER TRG_LOG_ALERTA_CONSUMO"));
        assertTrue(text.contains("EXECUTE IMMEDIATE V_SQL INTO V_TOTAL USING P_USUARIO_ID"));
        assertTrue(Files.exists(Path.of("src/main/resources/db/oracle/010_test_pkg_consumo.sql")));
    }

    @Test
    void yamlDoPostgresContinuaValidate() throws IOException {
        String yaml = Files.readString(Path.of("src/main/resources/application.yml"));
        assertTrue(yaml.contains("jdbc:postgresql"));
        assertTrue(yaml.contains("ddl-auto: validate"));
        assertTrue(yaml.contains("ORACLE_URL"));
        assertFalse(yaml.contains("jdbc:oracle:thin:@//"));
    }
}
