# Multi-stage Dockerfile for FD_Module_Group9 services
# Uses pre-built JARs from local build (much faster than rebuilding in Docker)
# Note: auth-service is now centralized in Auth_Sec module

FROM eclipse-temurin:21-jre AS base
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
WORKDIR /app
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+ExitOnOutOfMemoryError"
USER app

# Java + Python base with pre-installed dependencies (cached image)
# Build base image with: docker build --target java-python-base -t fd-python-base -f FD_Module_Group9/Dockerfile .
FROM base AS java-python-base
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=app:app reports/python/requirements.txt /tmp/requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt
USER app

FROM java-python-base AS fd-account-service
USER app
ENV APP_PYTHON_EXECUTABLE=python3
COPY --chown=app:app reports /app/reports
COPY --chown=app:app fd-account-service/target/fd-account-service-1.0.0.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM base AS interest-batch-service
COPY --chown=app:app interest-batch-service/target/interest-batch-service-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM base AS statement-service
COPY --chown=app:app statement-service/target/statement-service-1.0.0.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM base AS notification-service
COPY --chown=app:app notification-service/target/notification-service-1.0.0.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
