FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY Auth_Sec/pom.xml Auth_Sec/pom.xml
COPY Auth_Sec/security-common Auth_Sec/security-common
RUN mvn -B -f Auth_Sec/pom.xml -N install && mvn -B -f Auth_Sec/security-common/pom.xml install -DskipTests
COPY banking-product-backend banking-product-backend
RUN mvn -B -f banking-product-backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /build/banking-product-backend/target/product-0.0.1-SNAPSHOT.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
