import * as monaco from 'monaco-editor';

// Import the workers in a production-safe way.
// This is different than in Monaco's documentation for Vite,
// but avoids a weird error ("Unexpected usage") at runtime
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import sqlWorker from 'monaco-editor/esm/vs/basic-languages/sql/sql.js?worker';

self.MonacoEnvironment = {
  getWorker: function (_, label) {
    switch (label) {
      case 'sql':
      case 'SQL':
        return new sqlWorker();
      default:
        return new editorWorker();
    }
  }
};

export default monaco;
