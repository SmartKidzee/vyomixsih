import { Client } from "@gradio/client";

async function run() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
    const blob = await res.blob();
    
    console.log("Connecting...");
    const client = await Client.connect("https://fadcdf22a1a7be09a0.gradio.live");
    console.log("Connected. Sending predict...");
    const result = await client.predict("/predict", [
      blob,
      "hello",
      "vqa"
    ]);
    console.log("Result:", result.data);
  } catch (e) {
    console.error("Error:", e.message, e);
  }
}
run();
