# Dockerfile for Auth_Sec module
# Uses pre-built JARs from local build (much faster than rebuilding in Docker)

FROM eclipse-temurin:21-jre AS base
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
WORKDIR /app
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+ExitOnOutOfMemoryError"
USER app

FROM base AS auth-service
COPY --chown=app:app auth-service/target/auth-service-1.0.0.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
