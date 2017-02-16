/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { HostListener, Directive, Input, ElementRef, OnInit, OnDestroy, NgZone }
  from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';
import { DataService } from '../shared/data.service';
import { ConfigService } from '../shared/config.service';

@Directive({
   selector: '[second]'
})

export class SecondDirective implements OnInit, OnDestroy {
  public data: any;
  public config: any;
  public border: any;
  public round: any;
  public xdim: any;
  public ydim: any;
  public shaperenderingmode: any;
  public dimsum: any;
  public context: any;
  public comment: any;
  public width: any;
  public height: any;
  public outerWidth: any;
  public outerHeight: any;
  public colorNominal: any;
  public color: any;
  public colorScaleForHeatMap: any;
  public renderData: any;
  public xValue: any;
  public yValue: any;
  public xScale: any;
  public yScale: any;
  public xAxis: any;
  public yAxis: any;
  public xMap: any;
  public yMap: any;
  public nest: any;
  public defaultBinSize: any;
  public marginForBorderOfAxis: any;
  public marginClusterRatio: any;
  public node: any;
  public svg: any;
  public svgGroup: any;
  public nodeGroup: any;
  public brushGroup: any;
  public xAxisNodes: any;
  public yAxisNodes: any;
  public maskGroup: any;
  public tooltip: any;
  public clusterControlBox: any;
  public labelDiv: any;
  public margin: any;
  public zoom: any;
  public maxDotSize: any;
  public dimSetting: any;
  public initialLensSize: any;
  public initialRectLensWidth: any;
  public initialRectLensHeight: any;
  public initialCircleLensR: any;
  public initialHistLensWidth: any;
  public initialHistLensHeight: any;
  public initialInnerRadiusOfPieLens: any;
  public brush: any;
  public shiftKey: any;
  @Input('second') private gatherplot: any;
  private scale: number;
  private isInitialized: boolean;
  private configSubscription: Subscription;
  private roundSubscription: Subscription;
  private borderSubscription: Subscription;
  private shapeRenderingSubscription: Subscription;
  private dimsumSubscription: Subscription;
  private contextSubscription: Subscription;
  private dataSubscription: Subscription;

  constructor(private el: ElementRef, private zone: NgZone,
              private configService: ConfigService, private dataService: DataService) {
  }

  public ngOnInit() {
    this.isInitialized = false;

    this.configSubscription = this.configService.config$
         .subscribe((config) => {
           if (config !== null && config !== undefined) {
             this.config = config;
             this.xdim = config.xDim;
             this.ydim = config.yDim;
             if ((config.dims !== null && config.dims !== undefined
               && Object.keys(config.dims).length !== 0)
               && (this.data !== null && this.data !== undefined
               && Object.keys(this.data).length !== 0)) {
               this.identifyAndUpdateDimDataType();
               if (this.isInitialized) {
                 this.handleConfigChange(this.data, config);
               } else {
                 this.renderDataChange(this.data, config);
                 this.isInitialized = true;
               }
             }
           }
         });
    this.borderSubscription = this.configService.border$
         .subscribe((border) => {
           this.border = border;
           this.renderBorderChange(border);
         });
    this.roundSubscription = this.configService.round$
         .subscribe((round) => {
           this.round = round;
           this.renderRoundChange(round);
         });
    this.shapeRenderingSubscription = this.configService.shapeRendering$
         .subscribe((shapeRendering) => {
           this.shaperenderingmode = shapeRendering;
           this.renderShapeRenderingChange(shapeRendering);
         });
    this.dimsumSubscription = this.configService.dimsum$
         .subscribe((dimsum) => {
           this.dimsum = dimsum;
           this.handleDimsumChange(dimsum);
         });
    this.contextSubscription = this.configService.context$
         .subscribe((context) => this.context = context);
    this.dataSubscription = this.dataService.data$
         .subscribe((data) => {
          if (data !== null && data !== undefined && Object.keys(data).length !== 0) {
            this.data = data;
            if (this.config !== null && this.config !== undefined
              && this.config.dims !== null && this.config.dims !== undefined
              && Object.keys(this.config.dims).length !== 0) {
              this.renderDataChange(data, this.config);
            }
          }
         });
    // Constants and Setting Environment letiables
    this.margin = 80;
    this.maxDotSize = 4;

    if (this.config.matrixMode === true) {
        this.margin = 5;
        this.maxDotSize = 5;
    }
    this.width = 1040;
    this.height = 820;
    this.outerWidth = this.width + 2 * this.margin;
    this.outerHeight = this.height + 2 * this.margin;
    this.colorNominal = d3.scaleOrdinal(d3.schemeCategory10);
    this.colorScaleForHeatMap = d3.scaleLinear()
        .range([0x98c8fd, 0x08306b])
        .interpolate(d3.interpolateHsl);
    this.nest = <any> {};

    this.defaultBinSize = 10;

    this.marginForBorderOfAxis = 0.5; // Margin for Border Of Axis

    this.marginClusterRatio = 0.1; // Ratio of margin in the cluster

    this.dimSetting = <any> {};

    this.config.binSize = this.defaultBinSize;

    this.initialLensSize = 100;

    this.initialRectLensWidth = 100;

    this.initialRectLensHeight = 100;

    this.initialCircleLensR = 50;

    this.initialHistLensWidth = 120;
    this.initialHistLensHeight = 90;
    this.scale = 1;
    this.initialInnerRadiusOfPieLens = 20;

    this.brush = d3.brush();
    // dimsum = <any>{};

    d3.select('body')
        .attr('tabindex', 1)
        .on('keydown.brush', this.keyflip.bind(this))
        .on('keyup.brush', this.keyflip.bind(this))
        .each(() => {
            focus();
        });

    // .value('title');

    if (!this.config.matrixMode) {

        this.labelDiv = d3.select(this.el.nativeElement)
            .append('div')
            .attr('class', 'btn-group')
            .html('<a class="btn btn-default" title="Pan and Zoom" id="toolbarPanZoom"><i class="fa fa-search-plus"></i></a><a class="btn btn-default" title="Select" id="toolbarSelect"><i class="fa fa-square-o"></i></a><a class="btn btn-default" title="Reset" id="toolbarReset"><i class="fa fa-undo"></i></a>');
    }
    this.svg = d3.select(this.el.nativeElement)
        .append('svg:svg');

    this.svgGroup = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');

    this.maskGroup = this.svgGroup.append('g')
        .attr('class', 'masks');

    this.nodeGroup = this.maskGroup.append('g')
        .attr('class', 'nodes');

    this.nodeGroup.append('rect')
        .attr('class', 'overlay')
        .attr('width', this.width)
        .attr('height', this.height);

    this.brushGroup = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');

    this.xAxisNodes = this.svgGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')');

    this.yAxisNodes = this.svgGroup.append('g')
        .attr('class', 'y axis');

    this.tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    this.clusterControlBox = d3.select('body').append('div')
        .attr('class', 'clusterControlBox')
        .style('opacity', 0);

  }

  public ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.configSubscription.unsubscribe();
    this.borderSubscription.unsubscribe();
    this.shapeRenderingSubscription.unsubscribe();
    this.dimsumSubscription.unsubscribe();
    this.contextSubscription.unsubscribe();
    this.shapeRenderingSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.zone.run(() => {});
    this.handleConfigChange(this.data, this.config);
  }

  /*
        this.$watch(() => {
            return this.comment;
        }, function(newVals, oldVals) {
            if (newVals === true) {
                return this.handleConfigChange(renderData, this.config);
            }
        }, false);

    */

    public handleDimsumChange(newDimsum) {
        if (!this.node) {
            return;
        }
        if (!this.dimsum) {
            return;
        }
        if (!this.dimsum.selectionSpace) {
            return;
        }

        this.node.classed('selected', (d) => {

            if (this.dimsum.selectionSpace.indexOf(d.id) === -1) {

                d.selected = false;
            } else {

                d.selected = true;
            }

            return d.selected;
        });

        this.dimsum.source = 'gatherplot';

    }

    public renderBorderChange(isBorder) {

        this.svgGroup.selectAll('.dot')
            .style('stroke', (d) => {
                return isBorder ? 'black' : 'none';
            });

    }

    public renderRoundChange(isRound) {

        this.svgGroup.selectAll('.dot')
            .transition()
            .duration(500)
            .attr('rx', (d) => {
                return isRound ? +d.nodeWidth / 2 : 0;
            })
            .attr('ry', (d) => {
                return isRound ? +d.nodeWidth / 2 : 0;
            });

    }

    public renderShapeRenderingChange(newShapeRendering) {

        this.svgGroup.selectAll('.dot')
            .style('shape-rendering', newShapeRendering);

    }

    public reloadDataToSVG() {
        this.svgGroup.selectAll('*').remove();

        this.maskGroup = this.svgGroup.append('g')
            .attr('class', 'masks');

        this.nodeGroup = this.maskGroup.append('g')
            .attr('class', 'nodes');

        this.maskGroup.selectAll('rect').remove();

        this.drawBackground();

        if (this.config.matrixMode === false) {

            this.node = this.nodeGroup.selectAll('.dot')
                .data(this.data)
                .enter().append('rect')
                .attr('class', 'dot')
                .on('mouseover', (d) => {

                    this.tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);

                    this.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);

                    this.tooltip.html(this.xdim + ':' + this.xOriginalValue(d) + '<br/>' + this.ydim + ':' + this.yOriginalValue(d) + '<br/>' + this.config.colorDim + ':' + this.colorOriginalValue(d) + '')
                        .style('left', (d3.event.pageX + 5) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px');
                })
                .on('mouseout', (d) => {
                    this.tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                })
                .on('mousedown', function(d) {
                    if (d3.event.shiftKey) {
                      d3.select(this).classed('selected', d.selected = !d.selected);
                    } else {
                      this.node.classed('selected', (p) => {
                        return p.selected = d === p;
                      });
                    }
                });

        } else {

            this.nodeGroup.selectAll('.dot')
                .data(this.data)
                .enter().append('rect')
                .attr('class', 'dot');

            this.svg.on('mouseover', (d) => {
                    this.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);

                    this.tooltip.html('<h3>' + this.xdim + ' vs ' + this.ydim + '</h3>')
                        .style('left', (d3.event.pageX + 5) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px');
                })
                .on('mouseout', (d) => {
                    this.tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                })
                /*.on('click', (d) => {

                    return this.onClick({
                        item: {
                            xDim: this.xdim,
                            yDim: this.ydim
                        }
                    });
                });
*/

        }


        this.dimSetting = <any> {};


    }

    public identifyAndUpdateDimDataType() {

        for (let i = 0; i < this.config.dims.length; i++) {
            let dim = this.config.dims[i];
            this.dimSetting[dim] = <any>{};
            this.dimSetting[dim].dimType = this.identifyDimDataType(dim);
            this.prepareDimSettingKeys(dim);

        }

    }

    public prepareDimSettingKeys(dim) {

        let currentDimSetting = this.dimSetting[dim];

        if (currentDimSetting.dimType === 'ordinal') {

            //doBinningAndSetKeys(dim);
            currentDimSetting.isBinned = true;


        } else {

            this.setKeysFromOriginalData(dim);
            currentDimSetting.isBinned = false;

        }
    }
}
