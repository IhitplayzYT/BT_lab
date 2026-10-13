package com.bank.calculator.exception;

/** Thrown when a required dependency (Product or Customer Service) is unreachable. */
public class ServiceUnavailableException extends FdCalculatorException {
    public ServiceUnavailableException(String serviceName, Throwable cause) {
        super("SERVICE_UNAVAILABLE",
              "Required service is temporarily unavailable: " + serviceName);
        initCause(cause);
    }
}
