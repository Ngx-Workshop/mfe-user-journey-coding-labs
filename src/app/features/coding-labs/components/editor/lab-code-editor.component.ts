import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, output, viewChild } from '@angular/core';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
@Component({
  selector: 'ngx-lab-code-editor', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="lab-editor__host" #editor></div>`,
  styles: [`:host { display: block; min-width: 0; } .lab-editor__host { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }`],
})
export class LabCodeEditorComponent implements AfterViewInit, OnDestroy {
  readonly code = input.required<string>();
  readonly language = input.required<string>();
  readonly readOnly = input(false);
  readonly changed = output<string>();
  private readonly element = viewChild.required<ElementRef<HTMLElement>>('editor');
  private editor?: EditorView;
  private readonly editability = new Compartment();
  constructor() {
    effect(() => {
      const code = this.code();
      if (this.editor && code !== this.editor.state.doc.toString()) this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: code } });
    });
    effect(() => {
      const readOnly = this.readOnly();
      if (this.editor) this.editor.dispatch({ effects: this.editability.reconfigure([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]) });
    });
  }
  ngAfterViewInit() {
    this.editor = new EditorView({ parent: this.element().nativeElement,
      state: EditorState.create({ doc: this.code(), extensions: [this.editability.of([EditorState.readOnly.of(this.readOnly()), EditorView.editable.of(!this.readOnly())]), lineNumbers(), history(), drawSelection(), highlightActiveLine(),
        javascript({ typescript: this.language() === 'typescript' }), syntaxHighlighting(defaultHighlightStyle),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.contentAttributes.of({ 'aria-label': 'Lab solution code', 'aria-describedby': 'lab-editor-help' }),
        EditorView.theme({ '&': { backgroundColor: 'var(--panel)', color: 'var(--ink)', fontSize: '13px' },
          '.cm-content': { minHeight: '330px', fontFamily: 'monospace', padding: '16px 0' }, '.cm-scroller': { overflow: 'auto' },
          '.cm-gutters': { backgroundColor: 'var(--soft)', color: 'var(--muted)', border: 'none' },
          '.cm-activeLine': { backgroundColor: 'var(--soft)' }, '.cm-activeLineGutter': { backgroundColor: 'var(--line)' } }),
        EditorView.updateListener.of(update => { if (update.docChanged) this.changed.emit(update.state.doc.toString()); }) ] }) });
  }
  ngOnDestroy() { this.editor?.destroy(); }
}
