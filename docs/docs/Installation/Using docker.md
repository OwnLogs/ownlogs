
<script>
  import { Commands, Definition, Demo } from "$lib/components";

  let commands = [{name:'npm', command:"npm install angus"}, {name:'pnpm', command:"pnpm install angus"}, {name:'bun', command:"bun add angus && bun add angus && bun add angus && bun add angus"}]
</script>


# Downloading docker

# Cloning the repository

```bash snippet
git clone https://github.com/Angus-Paillaugue/Logify && cd Logify
```

# Starting docker

To start your own Logify instance, you first need to configure it. Please refer to the [configuring](/docs/Configuration/General-config) page.

Then run the `run.sh` script :

```bash snippet
./run.sh
```

This script will set environment variables and pass them to the containers and build the containers.
