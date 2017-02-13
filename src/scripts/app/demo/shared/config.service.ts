import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConfigService {
  private configSource = new BehaviorSubject<any>({
    SVGAspectRatio: 1.4,
    isGather: 'scatter',
    relativeModes: [false, true],
    relativeMode: 'absolute',
    binSize: 10,
    matrixMode: false,
    isInteractiveAxis: false,
    lens: 'noLens'
  });
  private roundSource = new BehaviorSubject<boolean>(true);
  private borderSource = new BehaviorSubject<boolean>(false);
  private shapeRenderingSource = new BehaviorSubject<string>('auto');
  private dimsumSource = new BehaviorSubject<any>({selectionSpace: []});
  private contextSource = new BehaviorSubject<any>({translate: [0, 0], scale: 1});
  public config$ = this.configSource.asObservable();
  public round$ = this.roundSource.asObservable();
  public border$ = this.borderSource.asObservable();
  public shapeRendering$ = this.shapeRenderingSource.asObservable();
  public dimsum$ = this.dimsumSource.asObservable();
  public context$ = this.contextSource.asObservable();

  public setConfig(configs: any) {
    this.configSource.next(configs);
  }

  public setRound(round: boolean) {
    this.roundSource.next(round);
  }

  public setBorder(border: boolean) {
    this.borderSource.next(border);
  }

  public setShapeRendering(shapeRendering: string) {
    this.shapeRenderingSource.next(shapeRendering);
  }

  public setDimsum(dimsum: any) {
    this.dimsumSource.next(dimsum);
  }

  public setContext(context: any) {
    this.contextSource.next(context);
  }
}
