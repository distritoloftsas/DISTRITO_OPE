# Multi-stage build: compilamos con JDK 21 completo, corremos con JRE 21
# (imagen final mas pequena, ~200 MB vs ~500 MB de la JDK).
# Eclipse Temurin es el OpenJDK oficial mantenido por Adoptium.

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiamos solo el pom y descargamos dependencias primero
# para que esta capa se cachee mientras el codigo cambie.
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Ahora el codigo y compilacion final.
COPY src src
RUN ./mvnw -B -DskipTests clean package

# Stage final: solo JRE para reducir tamano.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/distrito-backend-0.0.1-SNAPSHOT.jar app.jar

# Defensa contra olvidar setear la variable en Railway. Si Railway la
# define, Railway gana (env vars de runtime sobrescriben ENV del image).
ENV SPRING_PROFILES_ACTIVE=prod

# Railway inyecta el puerto via $PORT pero nuestro yml lee SERVER_PORT.
# Ambos quedan disponibles al proceso.
EXPOSE 8080

# Healthcheck (opcional pero util en Railway):
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:${SERVER_PORT:-8080}/actuator/health || exit 1

# Diagnostico temporal: imprimir env vars al arrancar para confirmar
# que Railway las esta pasando. SPRING_DATASOURCE_PASSWORD se cifra
# en el log para no exponer.
ENTRYPOINT ["sh","-c","echo '== ENV VARS RELEVANTES ==' && printenv | grep -E '^(SPRING|JWT|SERVER|CORS|DB)_' | sed 's/PASSWORD=.*/PASSWORD=<masked>/' | sed 's/SECRET=.*/SECRET=<masked>/' | sort && echo '== STARTING JAVA ==' && exec java -jar app.jar"]
