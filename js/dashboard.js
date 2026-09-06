import * as THREE from "three";

import { OrbitControls } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";


// ============================================================
// MQTT
// ============================================================

const MQTT_URL =
    "ws://test.mosquitto.org:8080/mqtt";

const MQTT_TOPIC =
    "medready/aswin/equipment";


// ============================================================
// EQUIPMENT CONNECTION
// ============================================================

let lastMQTTMessageTime = 0;

const EQUIPMENT_TIMEOUT = 7000;


// ============================================================
// HTML ELEMENTS
// ============================================================

const deviceIdElement =
    document.getElementById("deviceId");

const locationElement =
    document.getElementById("location");

const locationValueElement =
    document.getElementById("locationValue");

const batteryValueElement =
    document.getElementById("batteryValue");

const batteryCardElement =
    document.getElementById("batteryCard");

const batteryFillElement =
    document.getElementById("batteryFill");

const faultValueElement =
    document.getElementById("faultValue");

const statusBadgeElement =
    document.getElementById("statusBadge");

const statusTextElement =
    document.getElementById("statusText");

const lastUpdateElement =
    document.getElementById("lastUpdate");

const phantomCardElement =
    document.getElementById("phantomCard");

const phantomMessageElement =
    document.getElementById("phantomMessage");

const readyCardElement =
    document.getElementById("readyCard");

const warningCardElement =
    document.getElementById("warningCard");

const notReadyCardElement =
    document.getElementById("notReadyCard");

const mqttDataElement =
    document.getElementById("mqttData");

const mqttStatusElement =
    document.getElementById("mqttStatus");

const connectionTextElement =
    document.getElementById("connectionText");

const connectionDotElement =
    document.querySelector(".mqtt-dot");

const threeCanvas =
    document.getElementById("threeCanvas");


// ============================================================
// INITIAL STATE
// ============================================================

deviceIdElement.textContent = "--";

locationElement.textContent = "--";

locationValueElement.textContent = "--";

batteryValueElement.textContent = "--";

batteryCardElement.textContent = "--";

batteryFillElement.style.width = "0%";

faultValueElement.textContent = "--";

statusTextElement.textContent = "WAITING";

lastUpdateElement.textContent = "--";


// Phantom

phantomCardElement.className =
    "phantom-card safe";

phantomCardElement
    .querySelector(".phantom-icon")
    .textContent = "•";

phantomCardElement
    .querySelector(".phantom-title")
    .textContent =
    "WAITING FOR EQUIPMENT DATA";

phantomMessageElement.textContent =
    "Waiting for the latest equipment status from MQTT.";


// Readiness

readyCardElement.classList.remove("active");

warningCardElement.classList.remove("active");

notReadyCardElement.classList.remove("active");


// ============================================================
// THREE.JS SCENE
// ============================================================

const scene =
    new THREE.Scene();


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        38,

        threeCanvas.clientWidth /
        threeCanvas.clientHeight,

        0.1,

        1000

    );


camera.position.set(

    7.2,
    4.8,
    11.5

);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        alpha: true

    });


renderer.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        2
    )

);


renderer.setSize(

    threeCanvas.clientWidth,

    threeCanvas.clientHeight

);


renderer.setClearColor(
    0x000000,
    0
);


renderer.domElement.style.display =
    "block";

renderer.domElement.style.width =
    "100%";

renderer.domElement.style.height =
    "100%";

renderer.domElement.style.cursor =
    "grab";


threeCanvas.appendChild(
    renderer.domElement
);


// ============================================================
// ORBIT CONTROLS
// ============================================================

const controls =
    new OrbitControls(

        camera,

        renderer.domElement

    );


controls.enableRotate =
    true;

controls.enableZoom =
    true;

controls.enablePan =
    true;


controls.enableDamping =
    true;

controls.dampingFactor =
    0.055;


controls.minAzimuthAngle =
    -Infinity;

controls.maxAzimuthAngle =
    Infinity;


controls.minPolarAngle =
    0;

controls.maxPolarAngle =
    Math.PI;


controls.minDistance =
    5;

controls.maxDistance =
    18;


controls.rotateSpeed =
    0.85;

controls.zoomSpeed =
    0.8;

controls.panSpeed =
    0.6;


controls.target.set(
    0,
    1,
    0
);


controls.update();


// ============================================================
// LIGHTS
// ============================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        2.4
    );

scene.add(
    ambientLight
);


const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        3.5
    );

mainLight.position.set(
    5,
    8,
    10
);

scene.add(
    mainLight
);


const frontLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

frontLight.position.set(
    0,
    5,
    10
);

scene.add(
    frontLight
);


const sideLight =
    new THREE.DirectionalLight(
        0xb8dce0,
        1.8
    );

sideLight.position.set(
    -6,
    4,
    5
);

scene.add(
    sideLight
);


// ============================================================
// PUMP
// ============================================================

const pump =
    new THREE.Group();

scene.add(
    pump
);


// ============================================================
// MAIN BODY
// ============================================================

const bodyGeometry =
    new THREE.BoxGeometry(
        2.4,
        3.2,
        1.05
    );


const bodyMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xd9e1e3,

        metalness: 0.15,

        roughness: 0.45

    });


const body =
    new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

pump.add(
    body
);


// ============================================================
// TOP
// ============================================================

const topGeometry =
    new THREE.BoxGeometry(
        2.5,
        0.3,
        1.1
    );


const topMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xb9c7ca,

        metalness: 0.1,

        roughness: 0.5

    });


const top =
    new THREE.Mesh(
        topGeometry,
        topMaterial
    );


top.position.y =
    1.5;


pump.add(
    top
);


// ============================================================
// SCREEN FRAME
// ============================================================

const screenGeometry =
    new THREE.BoxGeometry(
        1.75,
        0.9,
        0.12
    );


const screenMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x17363d,

        metalness: 0.2,

        roughness: 0.2

    });


const screen =
    new THREE.Mesh(
        screenGeometry,
        screenMaterial
    );


screen.position.set(
    0,
    0.65,
    0.58
);


pump.add(
    screen
);


// ============================================================
// SCREEN
// ============================================================

const innerScreenGeometry =
    new THREE.BoxGeometry(
        1.45,
        0.55,
        0.05
    );


const innerScreenMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x8ccfd0,

        emissive: 0x3d8f92,

        emissiveIntensity: 0.4

    });


const innerScreen =
    new THREE.Mesh(
        innerScreenGeometry,
        innerScreenMaterial
    );


innerScreen.position.set(
    0,
    0.65,
    0.66
);


pump.add(
    innerScreen
);


// ============================================================
// KNOB
// ============================================================

const knobGeometry =
    new THREE.CylinderGeometry(
        0.27,
        0.27,
        0.14,
        32
    );


const knobMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x52757a,

        metalness: 0.5,

        roughness: 0.3

    });


const knob =
    new THREE.Mesh(
        knobGeometry,
        knobMaterial
    );


knob.rotation.x =
    Math.PI / 2;


knob.position.set(
    0,
    -0.85,
    0.62
);


pump.add(
    knob
);


// ============================================================
// BUTTONS
// ============================================================

for (
    let i = 0;
    i < 4;
    i++
)
{

    const buttonGeometry =
        new THREE.CylinderGeometry(
            0.1,
            0.1,
            0.08,
            20
        );


    const buttonMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x6f8084,

            metalness: 0.2,

            roughness: 0.5

        });


    const button =
        new THREE.Mesh(
            buttonGeometry,
            buttonMaterial
        );


    button.rotation.x =
        Math.PI / 2;


    button.position.set(

        -0.72,

        0.05 -
        i * 0.35,

        0.62

    );


    pump.add(
        button
    );

}


// ============================================================
// STATUS LIGHT
// ============================================================

const statusLightGeometry =
    new THREE.SphereGeometry(
        0.12,
        24,
        24
    );


const statusLightMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x18a86b,

        emissive: 0x18a86b,

        emissiveIntensity: 2

    });


const statusLight =
    new THREE.Mesh(
        statusLightGeometry,
        statusLightMaterial
    );


statusLight.position.set(
    0.75,
    1.1,
    0.65
);


pump.add(
    statusLight
);


// ============================================================
// IV POLE
// ============================================================

const poleGeometry =
    new THREE.CylinderGeometry(
        0.045,
        0.045,
        3.2,
        20
    );


const poleMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x89989a,

        metalness: 0.7,

        roughness: 0.3

    });


const pole =
    new THREE.Mesh(
        poleGeometry,
        poleMaterial
    );


pole.position.set(
    1.05,
    2.9,
    0
);


pump.add(
    pole
);


// ============================================================
// IV BAG
// ============================================================

const bagGeometry =
    new THREE.BoxGeometry(
        0.65,
        0.85,
        0.25
    );


const bagMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xa9dfe0,

        transparent: true,

        opacity: 0.65,

        roughness: 0.2

    });


const bag =
    new THREE.Mesh(
        bagGeometry,
        bagMaterial
    );


bag.position.set(
    1.05,
    4.35,
    0
);


pump.add(
    bag
);


// ============================================================
// IV TUBE
// ============================================================

const tubeCurve =
    new THREE.CatmullRomCurve3([

        new THREE.Vector3(
            1.05,
            3.9,
            0
        ),

        new THREE.Vector3(
            1.05,
            2.9,
            0
        ),

        new THREE.Vector3(
            0.6,
            2.0,
            0
        ),

        new THREE.Vector3(
            0.6,
            1.1,
            0
        )

    ]);


const tubeGeometry =
    new THREE.TubeGeometry(
        tubeCurve,
        32,
        0.025,
        8,
        false
    );


const tubeMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x9bbfc0,

        transparent: true,

        opacity: 0.65

    });


const tube =
    new THREE.Mesh(
        tubeGeometry,
        tubeMaterial
    );


pump.add(
    tube
);


// ============================================================
// PUMP BASE
// ============================================================

const baseGeometry =
    new THREE.CylinderGeometry(
        1.25,
        1.25,
        0.2,
        32
    );


const baseMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x7f8d90,

        metalness: 0.45,

        roughness: 0.45

    });


const base =
    new THREE.Mesh(
        baseGeometry,
        baseMaterial
    );


base.position.y =
    -1.7;


pump.add(
    base
);


// ============================================================
// WHEELS
// ============================================================

for (
    let i = 0;
    i < 4;
    i++
)
{

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.16,
            0.16,
            0.12,
            20
        );


    const wheelMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x424e51,

            metalness: 0.3,

            roughness: 0.7

        });


    const wheel =
        new THREE.Mesh(
            wheelGeometry,
            wheelMaterial
        );


    wheel.rotation.z =
        Math.PI / 2;


    wheel.position.set(

        i % 2 === 0
            ? -0.85
            : 0.85,

        -1.85,

        i < 2
            ? -0.45
            : 0.45

    );


    pump.add(
        wheel
    );

}


// ============================================================
// LARGE CIRCULAR PLATFORM
// ============================================================

const platformGeometry =
    new THREE.CylinderGeometry(
        4.2,
        4.2,
        0.12,
        64
    );


const platformMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xeaf1f7,

        roughness: 0.85,

        metalness: 0.05

    });


const platform =
    new THREE.Mesh(
        platformGeometry,
        platformMaterial
    );


platform.position.set(
    0,
    -2.0,
    0
);


scene.add(
    platform
);


// ============================================================
// PLATFORM TOP
// ============================================================

const platformTopGeometry =
    new THREE.CircleGeometry(
        4.05,
        64
    );


const platformTopMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xffffff,

        roughness: 0.9,

        metalness: 0

    });


const platformTop =
    new THREE.Mesh(
        platformTopGeometry,
        platformTopMaterial
    );


platformTop.rotation.x =
    -Math.PI / 2;


platformTop.position.set(
    0,
    -1.93,
    0
);


scene.add(
    platformTop
);


// ============================================================
// PUMP POSITION
// ============================================================

pump.position.set(
    0,
    -0.25,
    0
);


// Large but complete

pump.scale.set(
    0.72,
    0.72,
    0.72
);


// Default angle

pump.rotation.y =
    -0.35;


// ============================================================
// 3D STATUS
// ============================================================

function update3DStatus(
    status
)
{

    let color;


    if (
        status === "READY"
    )
    {
        color =
            0x18a86b;
    }

    else if (
        status === "WARNING"
    )
    {
        color =
            0xe0a800;
    }

    else
    {
        color =
            0xd94343;
    }


    statusLightMaterial
        .color
        .setHex(
            color
        );


    statusLightMaterial
        .emissive
        .setHex(
            color
        );

}


// ============================================================
// ANIMATION
// ============================================================

function animate()
{

    requestAnimationFrame(
        animate
    );


    // NO automatic rotation

    controls.update();


    renderer.render(
        scene,
        camera
    );

}


animate();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(

    "resize",

    function ()
    {

        const width =
            threeCanvas.clientWidth;


        const height =
            threeCanvas.clientHeight;


        if (
            width === 0 ||
            height === 0
        )
        {
            return;
        }


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height
        );

    }

);


// ============================================================
// DASHBOARD UPDATE
// ============================================================

function updateDashboard(
    data
)
{

    // ========================================================
    // DEVICE
    // ========================================================

    deviceIdElement.textContent =
        data.device_id ||
        "PUMP-12";


    // ========================================================
    // LOCATION
    // ========================================================

    const currentLocation =
        data.location ||
        "ICU-2";


    locationElement.textContent =
        currentLocation;


    locationValueElement.textContent =
        currentLocation;


    // ========================================================
    // BATTERY
    // ========================================================

    let battery =
        Number(
            data.battery
        );


    if (
        !Number.isFinite(
            battery
        )
    )
    {
        battery = 0;
    }


    battery =
        Math.max(
            0,
            Math.min(
                100,
                battery
            )
        );


    batteryValueElement.textContent =
        battery + "%";


    batteryCardElement.textContent =
        battery + "%";


    batteryFillElement.style.width =
        battery + "%";


    // Battery colour

    if (
        battery < 20
    )
    {
        batteryFillElement.style.background =
            "#d94343";
    }

    else if (
        battery < 30
    )
    {
        batteryFillElement.style.background =
            "#e0a800";
    }

    else
    {
        batteryFillElement.style.background =
            "#276dcc";
    }


    // ========================================================
    // FAULT
    // ========================================================

    const fault =
        data.fault === true ||
        data.fault === "true";


    faultValueElement.textContent =
        fault
            ? "FAULT DETECTED"
            : "NONE";


    // ========================================================
    // READINESS
    // ========================================================

    let status;


    if (
        fault
    )
    {
        status =
            "NOT READY";
    }

    else if (
        battery < 20
    )
    {
        status =
            "NOT READY";
    }

    else if (
        battery < 30
    )
    {
        status =
            "WARNING";
    }

    else
    {
        status =
            "READY";
    }


    // ========================================================
    // STATUS BADGE
    // ========================================================

    statusTextElement.textContent =
        status;


    statusBadgeElement.className =
        "status-badge";


    if (
        status === "READY"
    )
    {
        statusBadgeElement.classList.add(
            "ready"
        );
    }

    else if (
        status === "WARNING"
    )
    {
        statusBadgeElement.classList.add(
            "warning"
        );
    }

    else
    {
        statusBadgeElement.classList.add(
            "not-ready"
        );
    }


    // ========================================================
    // READINESS CARDS
    // ========================================================

    readyCardElement.classList.remove(
        "active"
    );

    warningCardElement.classList.remove(
        "active"
    );

    notReadyCardElement.classList.remove(
        "active"
    );


    if (
        status === "READY"
    )
    {
        readyCardElement.classList.add(
            "active"
        );
    }

    else if (
        status === "WARNING"
    )
    {
        warningCardElement.classList.add(
            "active"
        );
    }

    else
    {
        notReadyCardElement.classList.add(
            "active"
        );
    }


    // ========================================================
    // PHANTOM AVAILABILITY
    // ========================================================

    const phantomDetected =
        fault ||
        battery < 20;


    if (
        phantomDetected
    )
    {

        phantomCardElement.className =
            "phantom-card detected";


        phantomCardElement
            .querySelector(
                ".phantom-icon"
            )
            .textContent =
            "!";


        phantomCardElement
            .querySelector(
                ".phantom-title"
            )
            .textContent =
            "PHANTOM AVAILABILITY DETECTED";


        if (
            fault
        )
        {
            phantomMessageElement.textContent =
                "Equipment appears available, but a fault has been detected.";
        }

        else
        {
            phantomMessageElement.textContent =
                "Equipment appears available, but its battery is too low for immediate use.";
        }

    }

    else
    {

        phantomCardElement.className =
            "phantom-card safe";


        phantomCardElement
            .querySelector(
                ".phantom-icon"
            )
            .textContent =
            "✓";


        phantomCardElement
            .querySelector(
                ".phantom-title"
            )
            .textContent =
            "NO PHANTOM AVAILABILITY";


        phantomMessageElement.textContent =
            "Equipment is available and ready for use.";

    }


    // ========================================================
    // 3D
    // ========================================================

    update3DStatus(
        status
    );


    // ========================================================
    // LAST UPDATE
    // ========================================================

    lastUpdateElement.textContent =
        new Date()
            .toLocaleTimeString();

}


// ============================================================
// MQTT CLIENT
// ============================================================

const clientId =
    "medready-dashboard-" +

    Math.random()
        .toString(16)
        .substring(2);


const mqttClient =
    mqtt.connect(

        MQTT_URL,

        {

            clientId:
                clientId,

            clean:
                true,

            reconnectPeriod:
                3000,

            connectTimeout:
                10000

        }

    );


// ============================================================
// MQTT CONNECT
// ============================================================

mqttClient.on(

    "connect",

    function ()
    {

        console.log(
            "MQTT broker connected"
        );


        connectionTextElement.textContent =
            "MQTT Connected";


        connectionDotElement.style.background =
            "#19a66a";


        mqttStatusElement.textContent =
            "Connected • Waiting for equipment";


        mqttClient.subscribe(

            MQTT_TOPIC,

            function (error)
            {

                if (
                    error
                )
                {

                    console.error(
                        "Subscribe error:",
                        error
                    );


                    mqttStatusElement.textContent =
                        "Subscription failed";


                    return;
                }


                console.log(
                    "Subscribed:",
                    MQTT_TOPIC
                );

            }

        );

    }

);


// ============================================================
// MQTT MESSAGE
// ============================================================

mqttClient.on(

    "message",

    function (
        topic,
        message
    )
    {

        try
        {

            const data =
                JSON.parse(
                    message.toString()
                );


            // IMPORTANT:
            // Equipment is alive

            lastMQTTMessageTime =
                Date.now();


            // Update dashboard

            updateDashboard(
                data
            );


            // Show JSON

            mqttDataElement.textContent =
                JSON.stringify(
                    data,
                    null,
                    2
                );


            mqttStatusElement.textContent =
                "Live data received";


            connectionTextElement.textContent =
                "MQTT Connected";


            connectionDotElement.style.background =
                "#19a66a";

        }

        catch (
            error
        )
        {

            console.error(
                "Invalid MQTT data:",
                error
            );

        }

    }

);


// ============================================================
// MQTT ERROR
// ============================================================

mqttClient.on(

    "error",

    function (
        error
    )
    {

        console.error(
            "MQTT error:",
            error
        );


        mqttStatusElement.textContent =
            "MQTT connection error";

    }

);


// ============================================================
// MQTT RECONNECT
// ============================================================

mqttClient.on(

    "reconnect",

    function ()
    {

        connectionTextElement.textContent =
            "MQTT Reconnecting";


        connectionDotElement.style.background =
            "#e0a800";

    }

);


// ============================================================
// EQUIPMENT OFFLINE
// ============================================================

setInterval(

    function ()
    {

        if (
            lastMQTTMessageTime === 0
        )
        {
            return;
        }


        const elapsed =
            Date.now() -
            lastMQTTMessageTime;


        if (
            elapsed >
            EQUIPMENT_TIMEOUT
        )
        {

            // ------------------------------------------------
            // EQUIPMENT OFFLINE
            // ------------------------------------------------

            connectionTextElement.textContent =
                "Equipment Offline";


            connectionDotElement.style.background =
                "#d94343";


            mqttStatusElement.textContent =
                "No recent equipment data";


            // ------------------------------------------------
            // DEVICE
            // ------------------------------------------------

            deviceIdElement.textContent =
                "PUMP-12";


            // ------------------------------------------------
            // LOCATION
            // ------------------------------------------------

            locationElement.textContent =
                "ICU-2";


            locationValueElement.textContent =
                "ICU-2";


            // ------------------------------------------------
            // BATTERY
            // ------------------------------------------------

            batteryValueElement.textContent =
                "--";


            batteryCardElement.textContent =
                "--";


            batteryFillElement.style.width =
                "0%";


            batteryFillElement.style.background =
                "#dfe7ef";


            // ------------------------------------------------
            // FAULT
            // ------------------------------------------------

            faultValueElement.textContent =
                "NO CONNECTION";


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            statusTextElement.textContent =
                "OFFLINE";


            statusBadgeElement.className =
                "status-badge not-ready";


            // ------------------------------------------------
            // READINESS
            // ------------------------------------------------

            readyCardElement.classList.remove(
                "active"
            );


            warningCardElement.classList.remove(
                "active"
            );


            notReadyCardElement.classList.add(
                "active"
            );


            // ------------------------------------------------
            // PHANTOM
            // ------------------------------------------------

            phantomCardElement.className =
                "phantom-card detected";


            phantomCardElement
                .querySelector(
                    ".phantom-icon"
                )
                .textContent =
                "!";


            phantomCardElement
                .querySelector(
                    ".phantom-title"
                )
                .textContent =
                "EQUIPMENT OFFLINE";


            phantomMessageElement.textContent =
                "No recent data received from the equipment.";


            // ------------------------------------------------
            // LAST UPDATE
            // ------------------------------------------------

            lastUpdateElement.textContent =
                "No recent data";


            // ------------------------------------------------
            // 3D RED
            // ------------------------------------------------

            update3DStatus(
                "NOT READY"
            );

        }

    },

    1000

);