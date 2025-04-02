import {Component, effect, input, OnInit} from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  template: `
    <div class="pdf-viewer bg-white rounded-lg shadow overflow-hidden">
      <div id="pspdfkit-container" class="w-full"></div>
    </div>
  `,
  standalone: true,
  styles: [`
    #pspdfkit-container {
      height: 80vh;
    }
  `]
})
export class PdfViewerComponent {

  fileUrl = input<string>();

  constructor() {
    effect(() => {
      if (this.fileUrl()) {
        NutrientViewer.load({
          baseUrl: `${location.protocol}//${location.host}/assets/`,
          document: this.fileUrl() as string,
          container: "#pspdfkit-container",
        }).then(instance => {
          (window as any).instance = instance;
        });
      }
    });
  }
}
