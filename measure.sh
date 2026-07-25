#!/bin/bash
cd /home/uzumaki/PactFlow/backend

echo "Building JAR..."
./gradlew bootJar -x test --no-daemon -q

echo "Running JAR..."
java -jar build/libs/pactflow-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev > startup.log 2>&1 &
PID=$!

echo "Waiting for startup to complete..."
timeout=60
while [ $timeout -gt 0 ]; do
    if grep -q "Started PactFlowApplication" startup.log; then
        echo "Startup complete!"
        break
    fi
    sleep 1
    ((timeout--))
done

kill -9 $PID

echo "--- METRICS ---"
echo "Total Startup Time:"
grep "Started PactFlowApplication" startup.log
echo "Tomcat Ready:"
grep "Tomcat started on port" startup.log
echo "EntityManagerFactory / JPA:"
grep "Initialized JPA EntityManagerFactory" startup.log
echo "Flyway:"
grep "Successfully applied" startup.log || echo "Flyway finished"
echo "Repositories:"
grep "Spring Data JPA repositories" startup.log || echo "Repositories scanned"
