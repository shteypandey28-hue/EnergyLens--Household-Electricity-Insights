const axios = require('axios');

// Configure the mock device
const API_URL = 'http://localhost:5001/api/iot/telemetry';
const APPLIANCE_ID = 'test-fridge-001'; // Matches the ID we'll use in the frontend

// Simulation parameters
const VOLTAGE_BASE = 230;
const POWER_BASE = 120; // Watts
let isCompressorOn = false;

console.log(`🔌 Starting IoT Simulation for appliance: ${APPLIANCE_ID}`);
console.log(`📡 Sending data to: ${API_URL}`);

setInterval(async () => {
    // 1. Simulate realistic fluctuations
    // Voltage fluctuates slightly
    const voltage = VOLTAGE_BASE + (Math.random() * 4 - 2); 
    
    // Simulate a fridge compressor turning on and off randomly
    if (Math.random() > 0.8) {
        isCompressorOn = !isCompressorOn;
        console.log(isCompressorOn ? '❄️ Compressor ON' : '💤 Compressor OFF');
    }

    // Power draw spikes when compressor is on
    let powerWatts = isCompressorOn 
        ? POWER_BASE + 200 + (Math.random() * 10) 
        : POWER_BASE + (Math.random() * 5);

    // Calculate current (P = V * I)
    const current = powerWatts / voltage;

    const payload = {
        applianceId: APPLIANCE_ID,
        powerWatts: powerWatts.toFixed(2),
        voltage: voltage.toFixed(2),
        current: current.toFixed(2),
        state: isCompressorOn ? 'ACTIVE' : 'IDLE'
    };

    try {
        await axios.post(API_URL, payload);
        process.stdout.write(`\rSent: ${payload.powerWatts}W | ${payload.voltage}V | ${payload.current}A      `);
    } catch (error) {
        console.error('\n❌ Failed to send telemetry:', error.message);
    }
}, 2000); // Send data every 2 seconds
