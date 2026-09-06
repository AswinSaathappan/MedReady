#include <WiFi.h>
#include <PubSubClient.h>

// ============================================================
// WIFI
// ============================================================

const char* ssid = "Wokwi-GUEST";
const char* password = "";


// ============================================================
// MQTT
// ============================================================

const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;

const char* mqtt_topic =
    "medready/aswin/equipment";


// ============================================================
// EQUIPMENT
// ============================================================

const char* device_id = "PUMP-12";
const char* location = "ICU-2";


// ============================================================
// PINS
// ============================================================

const int batteryPin = 34;
const int faultButtonPin = 27;

const int greenLED = 25;
const int yellowLED = 26;
const int redLED = 33;


// ============================================================
// MQTT
// ============================================================

WiFiClient espClient;
PubSubClient client(espClient);


// ============================================================
// TIMING
// ============================================================

unsigned long previousBlink = 0;
unsigned long previousPublish = 0;

bool ledState = false;

int blinkInterval = 1000;


// ============================================================
// WIFI
// ============================================================

void setupWiFi()
{
    Serial.println();
    Serial.print("Connecting to WiFi");

    WiFi.begin(
        ssid,
        password
    );

    while (
        WiFi.status() != WL_CONNECTED
    )
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi connected!");

    Serial.print("IP Address: ");
    Serial.println(
        WiFi.localIP()
    );
}


// ============================================================
// MQTT CONNECTION
// ============================================================

void reconnectMQTT()
{
    while (
        !client.connected()
    )
    {
        Serial.print(
            "Connecting to MQTT..."
        );

        String clientID =
            "MedReady-";

        clientID +=
            String(
                random(
                    1000,
                    9999
                )
            );


        if (
            client.connect(
                clientID.c_str()
            )
        )
        {
            Serial.println(
                "connected!"
            );
        }
        else
        {
            Serial.print(
                "failed, rc="
            );

            Serial.println(
                client.state()
            );

            delay(2000);
        }
    }
}


// ============================================================
// TURN OFF ALL LEDS
// ============================================================

void allLEDsOff()
{
    digitalWrite(
        greenLED,
        LOW
    );

    digitalWrite(
        yellowLED,
        LOW
    );

    digitalWrite(
        redLED,
        LOW
    );
}


// ============================================================
// BLINK LED
// ============================================================

void blinkLED(
    String status
)
{
    unsigned long currentTime =
        millis();


    if (
        currentTime -
        previousBlink >=
        blinkInterval
    )
    {
        previousBlink =
            currentTime;


        ledState =
            !ledState;


        allLEDsOff();


        if (
            status == "READY"
        )
        {
            digitalWrite(
                greenLED,
                ledState
            );
        }

        else if (
            status == "WARNING"
        )
        {
            digitalWrite(
                yellowLED,
                ledState
            );
        }

        else
        {
            digitalWrite(
                redLED,
                ledState
            );
        }
    }
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
    Serial.begin(
        115200
    );

    delay(1000);


    // Button
    pinMode(
        faultButtonPin,
        INPUT_PULLUP
    );


    // LEDs
    pinMode(
        greenLED,
        OUTPUT
    );

    pinMode(
        yellowLED,
        OUTPUT
    );

    pinMode(
        redLED,
        OUTPUT
    );


    allLEDsOff();


    // WiFi
    setupWiFi();


    // MQTT
    client.setServer(
        mqtt_server,
        mqtt_port
    );


    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "       MEDREADY IoT SYSTEM"
    );

    Serial.println(
        "================================"
    );
}


// ============================================================
// LOOP
// ============================================================

void loop()
{
    // ========================================================
    // MQTT CONNECTION
    // ========================================================

    if (
        !client.connected()
    )
    {
        reconnectMQTT();
    }

    client.loop();


    // ========================================================
    // BATTERY
    // ========================================================

    int rawBattery =
        analogRead(
            batteryPin
        );


    int battery =
        map(
            rawBattery,
            0,
            4095,
            0,
            100
        );


    battery =
        constrain(
            battery,
            0,
            100
        );


    // ========================================================
    // FAULT
    // ========================================================

    bool fault =
        digitalRead(
            faultButtonPin
        ) == LOW;


    // ========================================================
    // READINESS
    // ========================================================

    String status;


    if (
        fault
    )
    {
        status =
            "NOT READY";

        blinkInterval =
            250;
    }

    else if (
        battery < 20
    )
    {
        status =
            "NOT READY";

        blinkInterval =
            250;
    }

    else if (
        battery < 30
    )
    {
        status =
            "WARNING";

        blinkInterval =
            500;
    }

    else
    {
        status =
            "READY";

        blinkInterval =
            1000;
    }


    // ========================================================
    // PHANTOM AVAILABILITY
    // ========================================================

    bool phantomAvailability =
        status != "READY";


    // ========================================================
    // LED
    // ========================================================

    blinkLED(
        status
    );


    // ========================================================
    // PUBLISH EVERY 3 SECONDS
    // ========================================================

    if (
        millis() -
        previousPublish >=
        3000
    )
    {
        previousPublish =
            millis();


        // ====================================================
        // SERIAL
        // ====================================================

        Serial.println();

        Serial.println(
            "================================"
        );

        Serial.println(
            "       MEDREADY STATUS"
        );

        Serial.println(
            "================================"
        );


        Serial.print(
            "Device   : "
        );

        Serial.println(
            device_id
        );


        Serial.print(
            "Location : "
        );

        Serial.println(
            location
        );


        Serial.print(
            "Battery  : "
        );

        Serial.print(
            battery
        );

        Serial.println(
            "%"
        );


        Serial.print(
            "Fault    : "
        );

        Serial.println(
            fault
                ? "YES"
                : "NO"
        );


        Serial.print(
            "Status   : "
        );

        Serial.println(
            status
        );


        Serial.print(
            "Phantom Availability : "
        );

        Serial.println(

            phantomAvailability
                ? "DETECTED"
                : "NOT DETECTED"

        );


        // ====================================================
        // JSON
        // ====================================================

        char payload[300];


        snprintf(

            payload,

            sizeof(payload),

            "{\"device_id\":\"%s\","
            "\"location\":\"%s\","
            "\"battery\":%d,"
            "\"fault\":%s,"
            "\"status\":\"%s\","
            "\"phantom_availability\":%s}",

            device_id,

            location,

            battery,

            fault
                ? "true"
                : "false",

            status.c_str(),

            phantomAvailability
                ? "true"
                : "false"

        );


        Serial.print(
            "MQTT: "
        );

        Serial.println(
            payload
        );


        // ====================================================
        // NORMAL MQTT PUBLISH
        //
        // IMPORTANT:
        // NO retain
        // ====================================================

        if (
            client.connected()
        )
        {

            bool published =
                client.publish(
                    mqtt_topic,
                    payload
                );


            if (
                published
            )
            {
                Serial.println(
                    "Message published!"
                );
            }
            else
            {
                Serial.println(
                    "Message publish failed!"
                );
            }

        }


        Serial.println(
            "================================"
        );
    }


    delay(20);
}