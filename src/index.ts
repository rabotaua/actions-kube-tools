import { join } from "path";
import { chmod, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import { addPath, getInput, exportVariable, setFailed } from "@actions/core";
import { find, downloadTool, extractZip, cacheFile } from "@actions/tool-cache";
import { exec } from "@actions/exec";

export const KUBECTL_VERSION = "1.22.3";
export const HELM_VERSION = "3.7.1";

async function kubectl() {
  const kubectlVersion = getInput("kubectlVersion", { required: false }) || KUBECTL_VERSION;

  const name = "kubectl";
  const arch = "amd64";
  const ver = `v${kubectlVersion}`;
  const url = `https://storage.googleapis.com/kubernetes-release/release/${ver}/bin/linux/${arch}/kubectl`;

  const found = find(name, ver, arch);
  if (found) {
    addPath(found);
  } else {
    const tool = await downloadTool(url);
    const cached = await cacheFile(tool, name, name, ver, arch);
    await chmod(join(cached, name), "777");
    addPath(cached);
  }
}

async function helm() {
  const helmVersion = getInput("helmVersion", { required: false }) || HELM_VERSION;

  const name = "helm";
  const arch = "amd64";
  const ver = `v${helmVersion}`;
  const url = `https://get.helm.sh/helm-${ver}-linux-${arch}.zip`;

  const found = find(name, ver, arch);
  if (found) {
    addPath(found);
  } else {
    const zip = await downloadTool(url);
    const tool = await extractZip(zip);
    // const cached = await toolCache.cacheDir(tool, name, ver, arch)
    const cached = await cacheFile(join(tool, `linux-${arch}`, name), name, name, ver, arch);
    await chmod(join(cached, name), "777");
    addPath(cached);
  }
}

async function kubeconfig() {
  const config = getInput("kubeconfig", { required: true });
  const dest = join(process.env.RUNNER_TEMP!, randomBytes(16).toString("hex"));

  await writeFile(dest, config);
  await chmod(dest, "600");

  exportVariable("KUBECONFIG", dest);
}

async function helmLogin() {
  const githubUsername = getInput("githubUsername", { required: false });
  const githubPassword = getInput("githubPassword", { required: false });
  if (githubUsername && githubPassword) {
    await exec(`echo '${githubPassword}' | helm registry login ghcr.io -u ${githubUsername} --password-stdin`);
  }
}

export async function main() {
  await kubectl();
  await helm();
  await kubeconfig();
  await helmLogin();
}

main().catch(setFailed);
