# Kubernetes Tools

GitHub Action To Configure Basic Kubernetes Tools

## Inputs

## `kubeconfig`

**Required** The contents of kube config file which will be used by kubectl.

## Example usage

uses: rabotaua/actions-kube-tools@main
with:
  kubeconfig: ${{ secrets.KUBECONFIG }}

## Build

`npm run build`

**WARNING:** neither `parcel` nor `ncc` do not work under Windows

## TODO

- prettier
- eslint
- husky pre commit build OR add action which will build and commit result