package com.conectageracao.adminapi.exception;

public class OracleUnavailableException extends RuntimeException {

    public OracleUnavailableException(String message) {
        super(message);
    }

    public OracleUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
