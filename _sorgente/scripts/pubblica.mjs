// Copies the Vite build into the repo root served by GitHub Pages.
import { cpSync, rmSync } from "node:fs";
rmSync("../assets", { recursive: true, force: true });
cpSync("dist/assets", "../assets", { recursive: true });
cpSync("dist/index.html", "../index.html");
console.log("pubblicato in ../index.html + ../assets");
