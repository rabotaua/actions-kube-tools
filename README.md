# Kubernetes Tools

GitHub Action To Configure Basic Kubernetes Tools

## Inputs

## `kubeconfig`

**Required** The contents of kube config file which will be used by kubectl.

## Example usage

```yml
uses: rabotaua/actions-kube-tools@main
with:
  kubeconfig: ${{ secrets.KUBECONFIG }}
```
