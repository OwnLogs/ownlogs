<script lang="ts">
  import * as Form from '$lib/components/ui/form/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { formSchema, type FormSchema } from './schema';
  import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { toast } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { data, open = $bindable() }: { data: SuperValidated<Infer<FormSchema>>; open: boolean } =
    $props();

  const form = superForm(data, {
    validators: zodClient(formSchema),
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        open = false;
        toast.success(`You server "${f.data.name}" has been added.`, {
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to the server page
              goto(`/app/servers/${$page.data.newServerForm.id}`);
            }
          }
        });
      } else {
        toast.error('Please fix the errors in the form.');
      }
    }
  });

  const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/createServer" use:enhance>
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Server name</Form.Label>
        <Input {...props} bind:value={$formData.name} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="description">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Server description</Form.Label>
        <Input {...props} bind:value={$formData.description} />
        <p class="!m-0 text-sm text-muted-foreground">(Optional)</p>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="publicUrl">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Server's public URL</Form.Label>
        <Input {...props} bind:value={$formData.publicUrl} />
        <p class="!m-0 text-sm text-muted-foreground">(Optional): Used for uptime monitoring.</p>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button>Add</Form.Button>
</form>
