# ComplicatedAuth OpenAPI

The canonical HTTP contract for the ComplicatedAuth control plane and relying-party runtime API.

```sh
npm ci
npm run lint
npm run check:docs
npm run bundle
```

`openapi.yaml` is the source of truth. The two health operations explicitly opt
out of global console-cookie authentication; runtime and project-user
operations declare scoped Project service-credential authentication per operation. The servers
list intentionally contains only the same-origin console proxy and local API
until a production hostname is assigned.

Every operation must keep an authored summary and behavioral description.
Shared schemas, parameters, security schemes, and tags must also explain their
role; `npm run check:docs` enforces that documentation coverage in CI.

After changing the contract, regenerate the Go contract from the backend
repository and refresh the documentation snapshot:

```sh
(cd ../complicatedauth-backend && go generate ./internal/contract)
(cd ../complicatedauth-docs && npm run sync:openapi)
```
