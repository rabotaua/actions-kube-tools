import { rm, readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { main, KUBECTL_VERSION, HELM_VERSION } from "./index";

describe("actions-kube-tools", () => {
  it("downloads desired tools", async () => {
    // reset kubeconfig environment variable
    process.env.KUBECONFIG = "";

    // define inputs
    process.env.INPUT_KUBECONFIG = '{"foo": "bar"}';

    // define location of temp and cache directories
    process.env.RUNNER_TEMP = join(__dirname, "../temp/");
    process.env.RUNNER_TOOL_CACHE = join(__dirname, "../cache/");

    // cleanup previous runs if any
    await rm(process.env.RUNNER_TEMP, { recursive: true, force: true });
    await rm(process.env.RUNNER_TOOL_CACHE, { recursive: true, force: true });

    // run github action
    await main();

    // check that our tools chached
    let cacheFiles = await readdir(process.env.RUNNER_TOOL_CACHE);
    expect(cacheFiles).not.toEqual([]);
    expect(cacheFiles).toContain("kubectl");
    expect(cacheFiles).toContain("helm");
    // check that kubectl is cached and added to path
    cacheFiles = await readdir(join(process.env.RUNNER_TOOL_CACHE, "kubectl"));
    expect(cacheFiles).toContain(KUBECTL_VERSION);
    expect(process.env.PATH).toContain(join(process.env.RUNNER_TOOL_CACHE, "kubectl", KUBECTL_VERSION, "amd64"));
    let fileStats = await stat(join(process.env.RUNNER_TOOL_CACHE, "kubectl", KUBECTL_VERSION, "amd64", "kubectl"));
    expect(fileStats.isFile()).toBeTruthy();
    expect(fileStats.size).toBeGreaterThan(1024 * 1024);
    // check that helm is cached and added to path
    cacheFiles = await readdir(join(process.env.RUNNER_TOOL_CACHE, "helm"));
    expect(cacheFiles).toContain(HELM_VERSION);
    expect(process.env.PATH).toContain(join(process.env.RUNNER_TOOL_CACHE, "helm", HELM_VERSION, "amd64"));
    fileStats = await stat(join(process.env.RUNNER_TOOL_CACHE, "helm", HELM_VERSION, "amd64", "helm"));
    expect(fileStats.isFile()).toBeTruthy();
    expect(fileStats.size).toBeGreaterThan(1024 * 1024);

    // check that KUBECONFIG environment variable was set
    expect(process.env.KUBECONFIG).not.toEqual("");

    // check that KUBECONFIG points to a file with a content from input
    const kubeconfigContent = await readFile(process.env.KUBECONFIG, "utf-8");
    expect(kubeconfigContent).toEqual(process.env.INPUT_KUBECONFIG);

    // cleanup kubeconfig
    await rm(process.env.KUBECONFIG, { force: true });

    // second run should take less than few seconds because of cache
    const started = Date.now();
    await main();
    expect(Date.now() - started).toBeLessThan(5000);

    // cleanup kubeconfig
    await rm(process.env.KUBECONFIG, { force: true });
  }, 60000);
});
