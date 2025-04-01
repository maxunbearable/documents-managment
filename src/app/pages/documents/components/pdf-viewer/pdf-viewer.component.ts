import { Component, OnInit } from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  template: `
    <div class="pdf-viewer">
      <div id="pspdfkit-container" style="width: 100%; height: 100vh"></div>
    </div>
  `,
  standalone: true,
})
export class PdfViewerComponent implements OnInit {
  ngOnInit(): void {
    NutrientViewer.load({
      baseUrl: `${location.protocol}//${location.host}/assets/`,
      document: "/assets/document.pdf",
      container: "#nutrient-container",
    }).then(instance => {
      (window as any).instance = instance;
    });
  }
}
