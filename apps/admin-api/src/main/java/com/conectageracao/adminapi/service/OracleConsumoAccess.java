package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.exception.OracleUnavailableException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.annotation.PreDestroy;

/**
 * Pool Oracle só desta rota. Não é bean DataSource: o JPA e o JdbcTemplate
 * do Postgres permanecem os que o Spring já configurou.
 */
@Component
public class OracleConsumoAccess {

    static final String UNAVAILABLE =
            "Oracle de consumo indisponível. Os demais dados do painel continuam no Postgres.";

    private static final Logger log = LoggerFactory.getLogger(OracleConsumoAccess.class);

    private final String url;
    private final String username;
    private final String password;
    private final boolean configured;

    private volatile JdbcTemplate jdbcTemplate;
    private volatile HikariDataSource dataSource;

    public OracleConsumoAccess(
            @Value("${oracle.datasource.url:}") String url,
            @Value("${oracle.datasource.username:}") String username,
            @Value("${oracle.datasource.password:}") String password
    ) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.configured = StringUtils.hasText(url) && StringUtils.hasText(username);
        if (!this.configured) {
            log.warn("Oracle de consumo sem ORACLE_URL ou ORACLE_USERNAME. A rota responde erro até o ambiente definir as variáveis.");
        }
    }

    public JdbcTemplate require() {
        if (!configured) {
            throw new OracleUnavailableException(UNAVAILABLE);
        }
        JdbcTemplate existing = this.jdbcTemplate;
        if (existing != null) {
            return existing;
        }
        synchronized (this) {
            if (this.jdbcTemplate == null) {
                this.jdbcTemplate = open();
            }
            return this.jdbcTemplate;
        }
    }

    private JdbcTemplate open() {
        try {
            HikariConfig config = new HikariConfig();
            config.setPoolName("oracle-consumo");
            config.setJdbcUrl(url);
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName("oracle.jdbc.OracleDriver");
            config.setMaximumPoolSize(2);
            config.setConnectionTimeout(3000);
            config.setInitializationFailTimeout(-1);
            HikariDataSource source = new HikariDataSource(config);
            JdbcTemplate template = new JdbcTemplate(source);
            template.setQueryTimeout(3);
            this.dataSource = source;
            log.info("Pool Oracle de consumo criado. A conexão ocorre na primeira consulta.");
            return template;
        } catch (RuntimeException ex) {
            log.warn("Falha ao preparar o pool Oracle de consumo");
            throw new OracleUnavailableException(UNAVAILABLE, ex);
        }
    }

    @PreDestroy
    public void close() {
        HikariDataSource source = this.dataSource;
        if (source != null) {
            source.close();
        }
    }
}
