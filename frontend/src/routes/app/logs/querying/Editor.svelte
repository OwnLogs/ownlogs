<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { LoaderCircle } from 'lucide-svelte';
  import { mode } from 'mode-watcher';

  let { value = $bindable(''), language = 'sql' } = $props();

  let editorElement = $state();
  let editor = $state();
  let monaco = $state();
  let loaded = $state(false);

  /**
   * Loads the provided code into the editor.
   *
   * @param {string} code - The code to be loaded into the editor.
   * @param {string} [lang=language] - The programming language of the code. Defaults to the current language setting.
   */
  export function loadCode(code: string, lang: string = language) {
    // Dispose of any existing models
    monaco?.editor.getModels().forEach((model) => model.dispose());
    // Create a new model
    const model = monaco.editor.createModel(code, lang);
    editor.setModel(model);
  }

  /**
   * Resizes the editor.
   */
  export const resetEditorLayout = () => {
    if (!editor) return;
    editor?.layout({ width: 0, height: 0 });

    window.requestAnimationFrame(() => {
      const rect = editorElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      editor.layout({ width: rect.width, height: rect.height });
    });
  };

  onMount(async () => {
    loaded = true;
    monaco = (await import('./monaco')).default;
    // Create the editor
    editor = monaco.editor.create(editorElement, {
      theme: 'visual-studio',
      language,
      value,
      lineNumbers: 'on',
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: false,
      editor,
      automaticLayout: true,
      autoIndent: true,
      formatOnPaste: true,
      formatOnType: true,
      fontSize: 16,
      fontFamily: 'JetBrains Mono',
      fontLigatures: true,
      wordWrap: true,
      minimap: { enabled: false }
    });

    window.onresize = () => {
      resetEditorLayout();
    };

    // Responsible for updating the value when the editor content changes
    editor.onDidChangeModelContent(() => {
      value = editor.getValue();
    });
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });

  function updateTheme(theme: string) {
    const availableThemes = ['vs', 'vs-dark'];
    if (!availableThemes.includes(theme)) {
      theme = 'vs';
    }
    if (!editor) return;
    editor?.updateOptions({ theme: theme });
  }

  // Watch for changes in the mode
  $effect(() => {
    updateTheme($mode === 'dark' ? 'vs-dark' : 'vs');
  });

  export function setValue(value: string) {
    editor.setValue(value);
  }

  export function setError(msg: string, startLine: number, endLine: number) {
    monaco?.editor.setModelMarkers(editor?.getModel(), 'owner', [
      {
        message: msg,
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: startLine,
        startColumn: 0,
        endLineNumber: endLine
      }
    ]);
  }

  // Used from the outside when changing the pane size
  export function resizeEditor() {
    resetEditorLayout();
  }
</script>

<div class="relative flex grow flex-col overflow-hidden rounded-xl border border-border">
  {#if loaded}
    <div class="grow" bind:this={editorElement}></div>
  {:else}
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <LoaderCircle class="animate-spin" />
    </div>
  {/if}
</div>
