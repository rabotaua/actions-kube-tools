import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";

// process.env.RUNNER_TEMP = process.env.RUNNER_TEMP || path.join(__dirname, '../temp/')
// process.env.RUNNER_TOOL_CACHE = process.env.RUNNER_TOOL_CACHE || path.join(__dirname, '../cache/')

async function kubectl(ver: string) {
  const name = "kubectl";
  const arch = "amd64";
  const url = `https://storage.googleapis.com/kubernetes-release/release/${ver}/bin/linux/${arch}/kubectl`;

  const found = toolCache.find(name, ver, arch);
  if (found) {
    core.addPath(found);
  } else {
    const tool = await toolCache.downloadTool(url);
    const cached = await toolCache.cacheFile(tool, name, name, ver, arch);
    fs.chmodSync(path.join(cached, name), "777");
    core.addPath(cached);
  }
}

async function helm(ver: string) {
  const name = "helm";
  const arch = "amd64";
  const url = `https://get.helm.sh/helm-${ver}-linux-${arch}.zip`;

  const found = toolCache.find(name, ver, arch);
  if (found) {
    core.addPath(found);
  } else {
    const zip = await toolCache.downloadTool(url);
    const tool = await toolCache.extractZip(zip);
    // const cached = await toolCache.cacheDir(tool, name, ver, arch)
    const cached = await toolCache.cacheFile(path.join(tool, `linux-${arch}`, name), name, name, ver, arch);
    fs.chmodSync(path.join(cached, name), "777");
    core.addPath(cached);
  }
}

async function kubeconfig() {
  const config = core.getInput("kubeconfig", { required: true });
  const dest = path.join(process.env.RUNNER_TEMP!, crypto.randomBytes(16).toString("hex"));

  fs.writeFileSync(dest, config);
  fs.chmodSync(dest, "600");

  core.exportVariable("KUBECONFIG", dest);
}

async function main() {
  await kubectl("v1.22.3");
  await helm("v3.7.1");
  await kubeconfig();
  console.log("done");
}

main().catch(core.setFailed);
