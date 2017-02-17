/**
 * From https://github.com/intuinno/gatherplot/blob/master/app/scripts/directives/gatherplot.js
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
   selector: '[gatherplot]'
})

export class GatherplotDirective implements OnInit, OnDestroy {
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
  @Input('gatherplot') private gatherplot: any;
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


    public doBinningAndSetKeys(dimName, numBin) {

        let currentDimSetting = this.dimSetting[dimName];

        currentDimSetting.binnedData = this.data.map(this.binningFunc(dimName, numBin));

    }

    public binningFunc(dimName, numBin) {

        let minValue = d3.min(this.data, (d) => {
            return +d[dimName];
        });
        let maxValue = d3.max(this.data, (d) => {
            return +d[dimName];
        });

        let encodingBinScale = d3.scaleLinear()
            .range([0, numBin-1])
            .domain([minValue, maxValue]);

        let decodingBinScale = d3.scaleLinear()
            .domain([0, numBin-1])
            .range([minValue, maxValue]);

        let binKeys = d3.range(0, numBin, 1);

        binKeys = binKeys.map((d) => {
            return decodingBinScale(d + 0.5);
        });


        this.dimSetting[dimName].halfOfBinDistance = (decodingBinScale(1) - decodingBinScale(0)) / 2;

        this.dimSetting[dimName].keyValue = this.initializeKeyValueObject(binKeys);

        return (d) => {

            return decodingBinScale(Math.floor(encodingBinScale(d[dimName])) + 0.5);
        };

    }

    public setKeysFromOriginalData(dim) {

        if (!dim) {

            return '';

        }

        let nest = d3.nest()
            .key((d) => {
                return d[dim];
            })
            .entries(this.data);

        let keyValue = nest.map((d) => {
            return d.key;
        });

        if (this.dimSetting[dim].dimType === 'semiOrdinal') {

            keyValue.sort();
        }

        this.dimSetting[dim].keyValue = this.initializeKeyValueObject(keyValue);


    }

    public initializeKeyValueObject(keyValue) {

        let keyObject = <any>{};

        keyValue.forEach((d, i) => {
            keyObject[d] = <any>{};
            keyObject[d].keyValue = d;
            keyObject[d].sortedID = i;
            keyObject[d].isMinimized = false;
            keyObject[d].isMaximized = false;
            keyObject[d].calculatedPosition = i;
        });

        return keyObject;

    }


    public identifyDimDataType(dim) {

        if (this.isFirstSampleNumber(dim)) {

            return this.identifyOrdinalDimDataType(dim);
        } else {

            return 'nominal';
        }

    }

    public identifyOrdinalDimDataType(dim) {

        if (this.isSemiOrdinalDim(dim)) {

            return 'semiOrdinal';
        } else {

            return 'ordinal';
        }

    }

    public isSemiOrdinalDim(dim) {

        if (this.getRawNumberOfKeys(dim) < 60) {
            return true;
        } else {
            return false;
        }


    }

    public getRawNumberOfKeys(dim) {

        if (!dim) {

            return 1;
        }

        let nest = d3.nest()
            .key((d) => {
                return d[dim];
            })
            .entries(this.data);

        let keyValue = nest.map((d) => {
            return d.key;
        });

        return keyValue.length;

    }

    public getKeys(dim) {

        if (!dim) {

            return [''];
        }


        return d3.map(this.dimSetting[dim].keyValue).keys();
    }


    public isFirstSampleNumber(dim) {

        return !isNaN(this.data[0][dim]);

    }

    public renderDataChange(data, config) {

        if (!data) {
            return;
        }

        this.reloadDataToSVG();

        this.identifyAndUpdateDimDataType();

        this.handleConfigChange(data, config);

    } //End Data change renderer



    // define render function
    public handleConfigChange(data, config) {

        if (!data) {
            return;
        }

        this.renderConfigChange(data, config);

        this.handleLensChange(config);

    }

    public redrawLensRect(lensInfo) {

        let itemsOnLens = this.getLensData(lensInfo);

        this.calculatePositionForLensRect(itemsOnLens, lensInfo);

        this.drawLensItems(itemsOnLens, lensInfo);

    }

    public redrawLensHist(lensInfo) {

        let itemsOnLens = this.getLensData(lensInfo);

        this.calculatePositionForLensHist(itemsOnLens, lensInfo);

        this.drawLensItems(itemsOnLens, lensInfo);

    }

    public redrawLensPie(lensInfo) {

        let itemsOnLens = this.getLensData(lensInfo);

        this.calculatePositionForLensPie(itemsOnLens, lensInfo);

        this.drawLensItems(itemsOnLens, lensInfo);

    }

    public calculatePositionForLensRect(items, lensInfo) {

        items.sort(this.sortFuncByColorDimension());

        items.forEach((d, i) => {

            d.clusterID = i;
            d.lensX = lensInfo.centerX;
            d.lensY = lensInfo.centerY;

        })

        let box = this.getLensClusterSize(1, lensInfo);

        let maxNumElementInCluster = items.length;

        let size = this.calculateNodesSizeForAbsolute(box, maxNumElementInCluster);

        if (size > this.maxDotSize) {

            size = this.maxDotSize;
        }

        this.handleOffsetRectLens(items, box, size);

    }

    public handleOffsetRectLens(cluster, box, size) {

        if (box.widthOfBox > box.heightOfBox) {

            this.handleOffsetRectLensHorizontally(cluster, box, size);

        } else {

            this.handleOffsetRectLensVertically(cluster, box, size);
        }

    }

    public handleOffsetHistLens(cluster, box, size) {

        if (box.widthOfBox > box.heightOfBox) {

            this.handleOffsetHistLensHorizontally(cluster, box, size);

        } else {

            this.handleOffsetHistLensVertically(cluster, box, size);
        }

    }

    public calculatePositionForLensHist(items, lensInfo) {

        let nestedLensItems = d3.nest()
            .key((d) => {
                return d[this.config.colorDim];
            })
            .sortKeys(d3.ascending)
            .sortValues((a, b) => {
                return a[this.xdim] - b[this.xdim];
            })
            .entries(items);


        this.assignClusterIDOfNodesInOneKeyNestedItems(nestedLensItems);

        let box = this.getLensClusterSize(nestedLensItems.length, lensInfo);

        let maxNumElementInCluster = this.getClusterWithMaximumPopulationFromOneKeyNestedItems(nestedLensItems);

        let size = this.calculateNodesSizeForAbsolute(box, maxNumElementInCluster);

        if (size > this.maxDotSize) {

            size = this.maxDotSize;
        }

        nestedLensItems.forEach((d) => {
            this.handleOffsetHistLens(d.values, box, size);
        });

        nestedLensItems.forEach((d, i) => {

            d.values.forEach((d) => {
                d.lensX = lensInfo.centerX - lensInfo.width / 2 + (0.5 + i) * box.widthOfBox;
                d.lensY = lensInfo.centerY;
            });
        });

    }

    public calculatePositionForLensPie(items, lensInfo) {

        items.forEach((d, i) => {
            d.lensX = lensInfo.centerX;
            d.lensY = lensInfo.centerY;

        });

        let nestedLensItems = d3.nest()
            .key((d) => {
                return d[this.config.colorDim];
            })
            .sortKeys(d3.ascending)
            .sortValues((a, b) => {
                return a[this.xdim] - b[this.xdim];
            })
            .entries(items);

        let numElement = items.length;

        let layerSetting = this.calculateLayerSettingForPieLens(lensInfo, numElement);

        if (layerSetting.dotR > this.maxDotSize / 2) {

            layerSetting.dotR = this.maxDotSize / 2;
        }

        let clusterAngle = this.getClusterAngle(nestedLensItems, layerSetting, numElement);

        nestedLensItems.forEach((d, i) => {
            this.handleOffsetPieLens(d.values, layerSetting, clusterAngle[i], lensInfo);
        });

    }

    public handleOffsetPieLens(items, layerSetting, clusterAngle, lensInfo) {

        let currentLayer = 0;

        let angleOffset = clusterAngle.startAngle;

        items.forEach((d, i, j) => {

            d.nodeWidthLens = layerSetting.dotR * 2;
            d.nodeHeightLens = layerSetting.dotR * 2;

            angleOffset = angleOffset + layerSetting.layerIncrementalAngle[currentLayer];

            if (angleOffset >= clusterAngle.endAngle) {

                angleOffset = clusterAngle.startAngle;
                currentLayer++;
            }

            let angle = angleOffset;
            let innerR = layerSetting.layerInnerRadius[currentLayer];

            d.XOffsetLens = innerR * Math.cos(angle);
            d.YOffsetLens = -1 * innerR * Math.sin(angle);


        });
    }

    public getClusterAngle(nestedItems, layerSetting, numElement) {

        let clusterNumber = nestedItems.length;
        let offsetAngle = 0;

        let clusterAngle = nestedItems.map((d, i, j) => {

            let startAngle = offsetAngle;
            let endAngle = startAngle + 2 * Math.PI * (d.values.length / numElement);
            offsetAngle = endAngle;

            return {
                'startAngle': startAngle,
                'endAngle': endAngle
            };
        });

        return clusterAngle;

    }

    public calculateLayerSettingForPieLens(lensInfo, numElement) {

        let numLayer = 1;

        while (!this.isNumLayerLargeEnough(numLayer, lensInfo, numElement)) {
            numLayer++;
        }

        return this.calculateLayerSettingForPieLensWithNumLayer(numLayer, lensInfo, numElement);
    };

    public calculateLayerSettingForPieLensWithNumLayer(numLayer, lensInfo, numElement) {

        let layerSetting = <any>{};

        layerSetting.numLayer = numLayer;
        layerSetting.dotR = this.getDotRadiusFromNumLayer(numLayer, lensInfo);

        layerSetting.layerInnerRadius = [];
        layerSetting.layerIncrementalAngle = [];
        layerSetting.itemSetting = [];
        let itemCountStart = 0;

        for (let layer = 1; layer <= layerSetting.numLayer; layer++) {

            let innerR = this.getInnerRadiusPieLens(lensInfo, layer, layerSetting.dotR);
            layerSetting.layerInnerRadius.push(innerR);

            let incrementalAngle = this.getIncrementalAngleForPieLens(layerSetting.dotR, lensInfo, layer);
            layerSetting.layerIncrementalAngle.push(incrementalAngle);

            // for (let itemCount = itemCountStart; itemCount <= itemCountStart + count; itemCount++) {

            //     let itemSetting = {}

            //     itemSetting.layer = layer;
            //     itemSetting.incrementalAngle = incrementalAngle;
            //     layerSetting.itemSetting[itemCount] = itemSetting;

            //     console.log(itemCount);

            // }

            // itemCountStart = count;
        }

      //  for (let itemCount = 0; itemCount < numElement; itemCount++) {


      //  }

        return layerSetting;

    }

    public isNumLayerLargeEnough(numLayer, lensInfo, numElement) {

        let dotR = this.getDotRadiusFromNumLayer(numLayer, lensInfo);

        if (dotR >= lensInfo.innerRadius) {

            return false;
        }

        let accumulatedItemsCount = 0;

        for (let i = 1; i <= numLayer; i++) {

            accumulatedItemsCount = accumulatedItemsCount + this.numItemsInSingleLayer(i, dotR, lensInfo);
        }

        return (numElement <= accumulatedItemsCount);
    }

    public numItemsInSingleLayer(layerCount, dotR, lensInfo) {

        let angleForDot = this.getIncrementalAngleForPieLens(dotR, lensInfo, layerCount);
        let numItems = Math.floor(2 * Math.PI / angleForDot);

        return numItems;
    }

    public getIncrementalAngleForPieLens(dotR, lensInfo, layerCount) {

        let innerRadius = this.getInnerRadiusPieLens(lensInfo, layerCount, dotR);

        let halfAngle = Math.PI / 2 - Math.acos(dotR / innerRadius);

        return halfAngle * 2;

    }

    public getInnerRadiusPieLens(lensInfo, layerCount, dotR) {

        return lensInfo.innerRadius + (2 * (layerCount - 1) * dotR);
    }

    public getDotRadiusFromNumLayer(numLayer, lensInfo) {

        let dotR = (lensInfo.outerRadius - lensInfo.innerRadius) / (2 * numLayer - 1);

        return dotR;
    }

    public getLensClusterSize(clusterNumber, lensInfo) {

        let lensClusterSize = <any><any>{};

        lensClusterSize.widthOfBox = lensInfo.width / clusterNumber;

        lensClusterSize.heightOfBox = lensInfo.height;

        return lensClusterSize;
    }

    public drawLensItems(itemsOnLens, lensInfo) {
        if(itemsOnLens.length === 0) {
        return;
        }
        this.nodeGroup.selectAll('.dot')
            .data(itemsOnLens, (d) => {
                return d.id;
            }).remove();

        let lensItems = this.nodeGroup.selectAll('.lensItems')
            .data(itemsOnLens, (d) => {
                return d.id;
            });

        //Update
        //Transition from previous place to new place
        lensItems.transition()
            .duration(500)
            .attr('width', (d) => {
                // console.log(initialSquareLenth);
                return +d.nodeWidthLens;
            })
            .attr('height', (d) => {
                return +d.nodeHeightLens;
            })
            .attr('x', (d) => {
                return d.lensX;
            })
            .attr('y', (d) => {
                return d.lensY;
            })
            .attr('transform', (d, i) => {

                // if (d.cancer== 'Cancer') {
                //     console.log(height);
                // }
                return 'translate(' + (d.XOffsetLens) + ',' + (-(d.YOffsetLens)) + ') ';
            });
        //Enter
        //Append new circle
        //Transition from Original place to new place

        lensItems.enter().append('rect')
            .classed('lensItems', true)
            .classed('dot', false)
            .attr('y', this.yMap)
            .attr('x', this.xMap)
            .attr('width', (d) => {
                // console.log(initialSquareLenth);
                return +d.nodeWidth;
            })
            .attr('height', (d) => {
                return +d.nodeHeight;
            })
            .attr('rx', (d) => {
                return this.round ? +5 : 0;
            })
            .attr('ry', (d) => {
                return this.round ? +5 : 0;
            })

        .style('fill', (d) => {
                return this.color(d[this.config.colorDim]);
            })
            .transition()
            .duration(500)
            .attr('x', (d) => {
                return d.lensX;
            })
            .attr('y', (d) => {
                return d.lensY;
            })
            .attr('width', (d) => {
                // console.log(initialSquareLenth);
                return +d.nodeWidthLens;
            })
            .attr('height', (d) => {
                return +d.nodeHeightLens;
            })
            .attr('transform', (d, i) => {
                return 'translate(' + (d.XOffsetLens) + ',' + (-(d.YOffsetLens)) + ') ';
            });


        //Exit
        //Transition from previous place to original place
        //remove circle
        lensItems.exit()
            .classed('dot', true)
            .classed('lensItems', false)
            .transition()
            .duration(500)
            .attr('width', (d) => {
                // console.log(initialSquareLenth);
                return +d.nodeWidth;
            })
            .attr('height', (d) => {
                return +d.nodeHeight;
            })
            .attr('y', this.yMap)
            .attr('x', this.xMap)
            .attr('transform', (d, i) => {
                return 'translate(' + (d.XOffset) + ',' + (-(d.YOffset)) + ') ';
            });

    }



    public getLensData(lensInfo) {

        let itemsOnLens = this.data.filter((d) => {

            if (this.xMap(d) < lensInfo.centerX + lensInfo.width / 2 && this.xMap(d) > lensInfo.centerX - lensInfo.width / 2) {

                if (this.yMap(d) < lensInfo.centerY + lensInfo.height / 2 && this.yMap(d) > lensInfo.centerY - lensInfo.height / 2) {

                    return d;
                }
            }

        });

        if (lensInfo.type === 'pie') {
            itemsOnLens = itemsOnLens.filter((d) => {

                let x = this.xMap(d) - lensInfo.centerX;
                let y = this.yMap(d) - lensInfo.centerY;

                let dist = Math.sqrt(x * x + y * y);
                if (dist < lensInfo.outerRadius) {
                    return d;
                }
            });
        }


        return itemsOnLens;


    }

    public drawInitialRectLensItems(centerX, centerY, width, height) {

        let lensInfo = <any>{};

        lensInfo.centerX = centerX;
        lensInfo.centerY = centerY;
        lensInfo.type = 'rect';
        lensInfo.width = width;
        lensInfo.height = height;
        this.redrawLensRect(lensInfo);
    }

    public drawInitialHistLensItems(centerX, centerY, width, height) {

        let lensInfo = <any>{};

        lensInfo.centerX = centerX;
        lensInfo.centerY = centerY;
        lensInfo.type = 'hist';
        lensInfo.width = width;
        lensInfo.height = height;

        this.redrawLensHist(lensInfo);
    }

    public drawInitialPieLensItems(centerX, centerY, width, height) {

        let lensInfo = <any>{};

        lensInfo.centerX = centerX;
        lensInfo.centerY = centerY;
        lensInfo.type = 'pie';
        lensInfo.width = width;
        lensInfo.height = height;
        lensInfo.outerRadius = this.initialLensSize / 2;
        lensInfo.innerRadius = this.initialInnerRadiusOfPieLens;


        this.redrawLensPie(lensInfo);
    }


    public dragmoveRectLens(dom) {
        let xPos, yPos;

        let lensInfo = <any>{};
        d3.select(dom)
            .attr('x', xPos = Math.max(this.initialLensSize / 2, Math.min(this.width - this.initialLensSize / 2, d3.event.x)) - this.initialLensSize / 2)
            .attr('y', yPos = Math.max(this.initialLensSize / 2, Math.min(this.height - this.initialLensSize / 2, d3.event.y)) - this.initialLensSize / 2);

        // labelDiv.text(xPos);

        lensInfo.centerX = xPos + this.initialLensSize / 2;
        lensInfo.centerY = yPos + this.initialLensSize / 2;
        lensInfo.type = 'rect';
        lensInfo.width = this.initialLensSize;
        lensInfo.height = this.initialLensSize;


        this.redrawLensRect(lensInfo);


    }

    public dragmoveHistLens(dom) {

        let xPos, yPos;

        let lensInfo = <any>{};

        d3.select(dom)
            .attr('x', xPos = Math.max(this.initialHistLensWidth / 2, Math.min(this.width - this.initialHistLensWidth / 2, d3.event.x)) - this.initialHistLensWidth / 2)
            .attr('y', yPos = Math.max(this.initialHistLensHeight / 2, Math.min(this.height - this.initialHistLensHeight / 2, d3.event.y)) - this.initialHistLensHeight / 2);

        // labelDiv.text(xPos);

        lensInfo.centerX = xPos + this.initialHistLensWidth / 2;
        lensInfo.centerY = yPos + this.initialHistLensHeight / 2;
        lensInfo.type = 'hist';
        lensInfo.width = this.initialHistLensWidth;
        lensInfo.height = this.initialHistLensHeight;


        this.redrawLensHist(lensInfo);

    }

    public dragmovePieLens(dom) {

        let xPos, yPos;

        let lensInfo = <any>{};

        d3.select(dom)
            .attr('x', xPos = Math.max(this.initialLensSize / 2, Math.min(this.width - this.initialLensSize / 2, d3.event.x)) - this.initialLensSize / 2)
            .attr('y', yPos = Math.max(this.initialLensSize / 2, Math.min(this.height - this.initialLensSize / 2, d3.event.y)) - this.initialLensSize / 2);

        // labelDiv.text(xPos);

        lensInfo.centerX = xPos + this.initialLensSize / 2;
        lensInfo.centerY = yPos + this.initialLensSize / 2;
        lensInfo.type = 'pie';
        lensInfo.width = this.initialLensSize;
        lensInfo.height = this.initialLensSize;

        lensInfo.outerRadius = this.initialLensSize / 2;
        lensInfo.innerRadius = this.initialInnerRadiusOfPieLens;

        this.redrawLensPie(lensInfo);


    }

    public dragmoveCircle(dom) {

        let xPos, yPos;

        d3.select(dom)
            .attr('cx', xPos = Math.max(this.initialLensSize, Math.min(this.width - this.initialLensSize, d3.event.x)))
            .attr('cy', yPos = Math.max(this.initialLensSize, Math.min(this.height - this.initialLensSize, d3.event.y)));

        // labelDiv.text(xPos);

    }

    public handleRectLensChange() {
        //on at d3 is tricky handling 'this'. So 'tricky' idea should be applied
        const self = this;

        this.clearLens();

        let drag = d3.drag()
            .on('drag', function() {
              //'this' now DOM Element; Should use 'self' for original scope.
              self.dragmoveRectLens(this);
            })
            .on('start', () => {
                d3.event.sourceEvent.stopPropagation(); // silence other listeners
            });



        this.nodeGroup.append('rect')
            .attr('class', 'lens')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('width', this.initialLensSize)
            .attr('height', this.initialLensSize)
            .call(drag);

        this.drawInitialRectLensItems(this.width / 2 + this.initialLensSize / 2, this.height / 2 + this.initialLensSize / 2, this.initialLensSize, this.initialLensSize);
    }

    public handleHistLensChange() {
        //on at d3 is tricky handling 'this'. So 'tricky' idea should be applied
        const self = this;
        this.clearLens();

        let drag = d3.drag()
            .on('drag', function() {
              //'this' now DOM Element; Should use 'self' for original scope.
              self.dragmoveHistLens(this);
            })
            .on('start', () => {
                d3.event.sourceEvent.stopPropagation(); // silence other listeners
            });

        this.nodeGroup.append('rect')
            .attr('class', 'lens')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('width', this.initialHistLensWidth)
            .attr('height', this.initialHistLensHeight)
            .call(drag);

        this.drawInitialHistLensItems(this.width / 2 + this.initialHistLensWidth / 2, this.height / 2 + this.initialHistLensHeight / 2, this.initialHistLensWidth, this.initialHistLensHeight);

    }

    public handlePieLensChange() {
        //on at d3 is tricky handling 'this'. So 'tricky' idea should be applied
        const self = this;
        this.clearLens();

        let drag = d3.drag()
            .on('drag', function() {
              //'this' now DOM Element; Should use 'self' for original scope.
              self.dragmovePieLens(this);
            })
            .on('start', () => {
                d3.event.sourceEvent.stopPropagation(); // silence other listeners
            });

        this.nodeGroup.append('rect')
            .attr('class', 'lens')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('width', this.initialLensSize)
            .attr('height', this.initialLensSize)
            .attr('rx', this.initialLensSize / 2)
            .attr('ry', this.initialLensSize / 2)
            .call(drag);

        this.drawInitialPieLensItems(this.width / 2 + this.initialHistLensWidth / 2, this.height / 2 + this.initialHistLensHeight / 2, this.initialHistLensWidth, this.initialHistLensHeight);

    }

    public handleLensChange(config) {

        if (config.lens === 'noLens' || config.isGather !== 'scatter') {

            this.clearLens();

        } else if (config.lens === 'rectLens') {

            this.handleRectLensChange();

        } else if (config.lens === 'histLens') {

            this.handleHistLensChange();

        } else if (config.lens === 'pieLens') {

            this.handlePieLensChange();
        }

    }

    public clearLens() {

        this.nodeGroup.selectAll('.lens').remove();
        if(!this.nodeGroup.selectAll('.lensItems').empty()) {
            this.nodeGroup.selectAll('.lensItems')
                .classed('dot', true)
                .classed('lensItems', false)
                .transition()
                .duration(500)
                .attr('width', (d) => {
                    // console.log(initialSquareLenth);
                    return +d.nodeWidth;
                })
                .attr('height', (d) => {
                    return +d.nodeHeight;
                })
                .attr('y', this.yMap)
                .attr('x', this.xMap)
                .attr('transform', (d, i) => {
                    return 'translate(' + (d.XOffset) + ',' + (-(d.YOffset)) + ') ';
                });

        }
    }

    public updateSizeSVG(config) {
        // XPadding = 60;
        // YPadding = 30;
        // Update size of SVG

        if (config.matrixMode === false) {
            this.outerWidth = d3.select(this.el.nativeElement).node().offsetWidth;
        } else {
//            this.outerWidth = d3.select('.matrixGroup').node().offsetWidth;

            this.outerWidth = this.outerWidth / (this.config.dims.length) - 2;
        }
        // calculate the height
        this.outerHeight = this.outerWidth / config.SVGAspectRatio;

        this.svg.attr('height', this.outerHeight)
            .attr('width', this.outerWidth);

        this.width = this.outerWidth - 2 * this.margin;
        this.height = this.outerHeight - 2 * this.margin;

    }

    public renderConfigChange(data, config) {

        this.updateSizeSVG(config);

        // Call separate render for the rendering

        this.drawPlot();

        this.configZoomToolbar();

        this.configBrushToolbar();

        this.configZoom();

    }

    public configZoomToolbar() {

        d3.select('#toolbarPanZoom').on('click', this.configZoom.bind(this));

    }

    public configBrushToolbar() {

        d3.select('#toolbarSelect').on('click', setSelectMode.bind(this));

        function setSelectMode() {

            this.configBrush();
        }

    }

    public configBrush() {
        const self = this;
        this.brush = this.brushGroup.append('g')
            .datum(() => {
                return {
                    selected: false,
                    previouslySelected: false
                };
            })
            .attr('class', 'brush')
            .call(d3.brush()
                .extent([[0, 0], [this.width, this.height]])
                .on('start', (d0) => {
                    this.node.each((d) => {

                        // if (d.Name.indexOf('ciera') > 0) {
                        //     console.log(d);
                        // }

                        d.previouslySelected = d3.event.sourceEvent.shiftKey && d.selected;
                    });
                })
                .on('brush', () => {
                    let extent = d3.event.target.extent();

                    this.node.classed('selected', (d) => {

                    //     return d.selected = d.previouslySelected ^
                    //         (xScale(extent[0][0]) <= xMap(d) && xMap(d)
                    // < xScale(extent[1][0]) && yScale(extent[0][1]) >= yMap(d)
                    //  && yMap(d) > yScale(extent[1][1]));
                    // });

                        let nodeIndex = this.dimsum.selectionSpace.indexOf(d.id);

                        if (d.previouslySelected
                          && (this.xScale(extent()[0][0]) <= this.xMap(d)
                          &&  this.xScale(extent()[1][0] > this.xMap(d))
                          && this.yScale(extent()[0][1]) >= this.yMap(d)
                          && this.yScale(extent()[1][1]) < this.yMap(d))) {

                            if (nodeIndex === -1) {
                                this.dimsum.selectionSpace.push(d.id);
                            }
                        } else {

                            if (nodeIndex !== -1) {
                                this.dimsum.selectionSpace.splice(nodeIndex, 1);
                            }

                        }

                    });
                    this.zone.run(() => {});
                    this.handleDimsumChange(this.dimsum);
                })
                .on('end', function () {
                      d3.selectAll('.brush').remove();
              //      if (!d3.event.sourceEvent) {return;}
              //      d3.select(this).call(d3.event.target.move, null);
                    // console.log(this);
//                    d3.event.target.clear();
                  //  this.brush.move()
                //    this.brushGroup.select('.brush').call(.move, null);

                }));

        d3.select('#toolbarSelect').classed('active', true);
        d3.select('#toolbarPanZoom').classed('active', false);

    }

    public zoomUsingContext() {


        this.zoom.translate(this.context.translate);
        this.zoom.scaleTo(this.context.scale);

        this.svgGroup.select('.x.axis').each(this.xAxis);
        this.svgGroup.select('.y.axis').each(this.yAxis);

        this.nodeGroup.attr('transform', 'translate(' + this.context.translate[0] + ',' + this.context.translate[1] + ')scale(' + this.context.scale + ')');


        this.comment = false;

    }

    public configZoom() {

        d3.selectAll('.brush').remove();

        this.zoom = d3.zoom()
            .scaleExtent([1, 100])
            .on('zoom', zoomed.bind(this));

        this.svgGroup.call(this.zoom);

        function zoomed() {

            // this.zone.run();

            // this.comment = false;

            // zoom.x(this.xScale).y(this.yScale);

            this.svgGroup.select('.x.axis').call(
              this.xAxis.scale(d3.event.transform.rescaleX(this.xScale))
            );
            this.svgGroup.select('.y.axis').call(
              this.yAxis.scale(d3.event.transform.rescaleY(this.yScale))
            );

            this.context.translate = [d3.event.transform.x, d3.event.transform.y];
            this.context.scale = d3.event.transform.k;

            this.scale = d3.event.transform.k;
        //    this.context.xDomain = this.xScale.scale(d3.event.transform.k).domain();
          //  this.context.yDomain = this.yScale.scale(d3.event.transform.k).domain();

            this.nodeGroup.attr('transform', 'translate(' + d3.event.transform.x +
              ',' + d3.event.transform.y + ')scale(' + d3.event.transform.k + ')');

        }

        this.setClipPathForAxes();

        d3.select('#toolbarReset').on('click', reset.bind(this));

        d3.select('#toolbarSelect').classed('active', false);

        d3.select('#toolbarPanZoom').classed('active', true);

        function reset() {

            this.resetSelection();

            this.nodeGroup.transition()
                .duration(700)
                .attr('transform', 'translate(0,0) scale(1)');

            this.context.translate = [0, 0];
            this.context.scale = 1;

            // this.zone.run();

            d3.transition('resetZoom').duration(700).tween('zoom', () => {

                let range = this.getExtentConsideringXY(this.xdim, this.ydim);

                let xRange = range.xRange;
                let yRange = range.yRange;

                if (this.config.isGather === 'gather') {

                    let typeOfXYDim = this.findTypeOfXYDim();

                    if (typeOfXYDim === 'XNomYOrd') {

                        yRange = this.getExtentFromCalculatedPointsForBinnedGather(this.ydim);

                    } else if (typeOfXYDim === 'XOrdYNom') {

                        xRange = this.getExtentFromCalculatedPointsForBinnedGather(this.xdim);

                    }

                }

                let ix = d3.interpolate(this.xScale.domain(), xRange);
                let iy = d3.interpolate(this.yScale.domain(), yRange);

                return (t) => {
                //    this.zoom.scaleTo(1);

          //          this.zoom.x(this.xScale.domain(ix(t))).y(this.yScale.domain(iy(t)));
            /*        this.svgGroup.select('.x.axis').call(
                      this.xAxis.scale(this.xScale.domain(ix(t)))
                    );
                    this.svgGroup.select('.y.axis').call(
                      this.yAxis.scale(this.yScale.domain(iy(t)))
                    );*/
                };
            });
        }

        if (this.comment === true) {

            this.zoomUsingContext();

        } else {

            this.context.translate = [0, 0];
            this.context.scale = 1;
            this.context.xDomain = this.xScale.domain();
            this.context.yDomain = this.yScale.domain();

        }

    }

    public resetSelection() {

        if (!this.dimsum) {
            return;

        }

        this.dimsum.selectionSpace = [];
        this.handleDimsumChange(this.dimsum);
//        this.zone.run();
    }

    public setClipPathForAxes() {

        let clipXAxis = this.xAxisNodes.append('clipPath')
            .attr('id', 'clipXAxis')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.margin);

        this.xAxisNodes.attr('clip-path', 'url(#clipXAxis)');

        let clipYAxis = this.yAxisNodes.append('clipPath')
            .attr('id', 'clipYAxis')
            .append('rect')
            .attr('x', -300)
            .attr('y', -40)
            .attr('width', 300)
            .attr('height', this.height + 40);

        this.yAxisNodes.attr('clip-path', 'url(#clipYAxis)');

    }

    public drawPlot() {

        // this.drawBackground();

        this.drawNodes();

        this.drawMask();

        this.drawAxesAndLegends();

    }

    public drawBackground() {

        this.nodeGroup.append('rect')
            .attr('class', 'overlay')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    public drawMask() {

        let clip = this.maskGroup.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height);

        this.maskGroup.attr('clip-path', 'url(#clip)');


    }

    public drawAxesAndLegends() {

        if (this.config.matrixMode === false) {

            this.drawAxes();

            this.drawLegends();

        } else {

            // drawAxes();

            this.drawBoundaryForMatrix();
        }
    }


    public drawBoundaryForMatrix() {

        this.svgGroup.selectAll('.matrixFrame').remove();

        this.svgGroup.append('rect')
            .attr('class', 'matrixFrame')
            .attr('x', -this.margin)
            .attr('y', -this.margin)
            .attr('width', this.width + 2 * this.margin - 2)
            .attr('height', this.height + 2 * this.margin - 2);


    }



    public drawNodesForSameOrdDimGather() {

        this.prepareScaleForSameOrdDimGather();

        this.calculateParametersOfNodesForSameOrdDimGather();

        this.drawNodesInSVGForSameOrdDimGather();

    }

    public isSameOrdDimGather() {

        if (this.config.isGather === 'gather' &&
            this.xdim === this.ydim &&
            this.getDimType(this.xdim) === 'ordinal') {

            return true;

        } else {

            return false;
        }
    }

    public drawNodes() {

        if (this.isSameOrdDimGather()) {

            this.drawNodesForSameOrdDimGather();

        } else {

            this.drawNodesForDifferentDim();
        }


    }

    public drawNodesForDifferentDim() {

        this.prepareScale();

        this.calculateParametersOfNodes();

        this.drawNodesInSVG();

    }

    public calculateParametersOfNodes() {

        this.calculatePositionOfNodes();
        this.calculateOffsetOfNodes();

    }

    public calculateParametersOfNodesForSameOrdDimGather() {

        this.calculatePositionOfNodesForSameOrdDimGather();
        this.calculateOffsetOfNodesForSameOrdDimGather();

    }

    public getKeyValue(dim) {

        if (!dim) {
            return [''];
        }

        return this.dimSetting[dim].keyValue;
    }

    public getCalculatedPositions(dim) {

        let keyValue = this.getKeyValue(dim);

        let calculatedPosition = d3.map(keyValue)
            .entries()
            .map((d: any) => {
                return +d.value.calculatedPosition;
            });

        if (this.isDimTypeNumerical(this.getDimType(dim))) {

            calculatedPosition.sort((a, b) => {
                return a - b;
            });

        }

        return calculatedPosition;


    }



    public getSortedIDs(dim) {

        let keyValue = this.getKeyValue(dim);

        let calculatedPosition = d3.map(keyValue)
            .entries()
            .map((d: any) => {
                return +d.value.sortedID;
            });

        return calculatedPosition;

    }

    //Returns Extents of dimension
    //              Scatter         Jitter      Gather
    // ordinal      orig            orig        calculatedPoints
    // semiordinal  SortedID        SortedID    calculatedPoints
    // nominal      calculatedP     calculatedP calculatedPoints
    public getExtent(dim) {

        if (!dim) {

            return [-0.5, 0.5];
        } else if (dim === 'Null') {

            return [-0.5, 0.5];

        }

        if (this.config.isGather === 'gather') {

            if (this.dimSetting[dim].dimType === 'ordinal') {

                return this.getExtentFromOriginalExtent(dim);

            } else {

                return this.getExtentFromCalculatedPoints(dim);

            }
        } else if (this.dimSetting[dim].dimType === 'ordinal') {

            return this.getExtentFromOriginalExtent(dim);

        } else if (this.dimSetting[dim].dimType === 'semiOrdinal') {

            return this.getExtentFromSortedID(dim);

        } else {

            return this.getExtentFromSortedID(dim);
        }

    }

    public getDimType(dim) {

        if (!dim) {
            return 'nominal';
        } else if (dim === 'Null') {

            return 'nominal';


        } else {

            return this.dimSetting[dim].dimType;
        }
    }

    public getExtentFromSortedID(dim) {

        let sortedID = this.getSortedIDs(dim);

        let extent = d3.extent(sortedID);

        return [extent[0] - this.marginForBorderOfAxis, extent[1] + this.marginForBorderOfAxis];

    }


    public getExtentFromCalculatedPoints(dim) {

        this.calculatePositionOfCluster(dim);

        let calculatedPoints = this.getCalculatedPositions(dim);

        let max = calculatedPoints[calculatedPoints.length - 1];



        let maxPadding = this.getLastIncrement(dim);

        max = max + maxPadding;

        return [0, max];




    }

    public getExtentFromCalculatedPointsForBinnedGather(dim) {

        this.calculatePositionOfClusterForBinnedGather(dim);

        let calculatedPoints = this.getCalculatedPositions(dim);

        let max = calculatedPoints[calculatedPoints.length - 1];

        return [0 - 0.5, max + 0.5];




    }

    public getLastIncrement(dim) {

        if (!dim) {

            return;
        }

        let keyValue = this.dimSetting[dim].keyValue;
        let increment;
        let keyLength = d3.map(this.dimSetting[dim].keyValue).values().length;

        let key = this.getKeyFromIndex(dim, keyLength - 1);

        if (keyValue[key].isMinimized === true) {

            increment = this.marginClusterRatio;

        } else {

            increment = 0.5;

        }

        return increment;

    }

    public getExtentFromOriginalExtent(dim) {

        let originalValues = this.data.map((d) => {
            return +d[dim];
        });

        let extent = d3.extent(originalValues);

        return [extent[0] - this.marginForBorderOfAxis, extent[1] + this.marginForBorderOfAxis];
    }

    public getExtentConsideringXY(xdim, ydim) {

        let range = <any>{};

        let typeOfXYDim = this.findTypeOfXYDim();

        let xRange, yRange;

        if (typeOfXYDim === 'OrdOrd' && this.config.isGather === 'gather') {

            this.doBinningAndSetKeys(xdim, this.config.binSize);
            this.doBinningAndSetKeys(ydim, this.config.binSize);

            xRange = this.getExtentFromCalculatedPoints(xdim);
            yRange = this.getExtentFromCalculatedPoints(ydim);


        } else {

            xRange = this.getExtent(xdim);
            yRange = this.getExtent(ydim);

        }
        range.xRange = xRange;
        range.yRange = yRange;

        return range;

    }

    public prepareScale() {

        let range = this.getExtentConsideringXY(this.xdim, this.ydim);

        let xRange = range.xRange;
        let yRange = range.yRange;



        this.xScale = d3.scaleLinear().range([0, this.width]);

        this.xScale.domain(xRange);

        this.xMap = (d) => {
            return this.xScale(this.xValue(d));
        };

        this.yScale = d3.scaleLinear().range([this.height, 0]);
        this.yScale.domain(yRange);
        this.yMap = (d) => {
            return this.yScale(this.yValue(d));
        };


    }

    public keyflip() {
        this.shiftKey = d3.event.shiftKey || d3.event.metaKey;
    }

    public cross(a, b) {
        let c = [],
            n = a.length,
            m = b.length,
            i, j;
        for (i = -1; ++i < n;)
            for (j = -1; ++j < m;) c.push({
                x: a[i],
                i: i,
                y: b[j],
                j: j
            });
        return c;
    }

    public restoreXYScaleForSameOrdDimGather() {

        let xRange = this.getExtent(this.xdim);
        let yRange = this.getExtent(this.ydim);

        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.xScale.domain(xRange);

        this.xMap = (d) => {
            return this.xScale(this.xValue(d));
        };

        this.yScale = d3.scaleLinear().range([this.height, 0]);
        this.yScale.domain(yRange);
        this.yMap = (d) => {
            return this.yScale(this.yValue(d));
        };

    }

    public prepareScaleForSameOrdDimGather() {

        let longAxisLength, shortAxisLength;

        if (this.height < this.width) {

            longAxisLength = this.width;
            shortAxisLength = this.height;
        } else {

            longAxisLength = this.height;
            shortAxisLength = this.width;
        }

        let virtualAxisLength = Math.sqrt(Math.pow(longAxisLength, 2) + Math.pow(shortAxisLength, 2));



        let xRange = [0, 1];
        let yRange = this.getExtent(this.ydim);

        this.xScale = d3.scaleLinear().range([0, shortAxisLength]);
        this.xScale.domain(xRange);

        this.xMap = (d) => {
            return this.xScale(this.xValue(d));
        };

        this.yScale = d3.scaleLinear().range([this.height, this.height - virtualAxisLength]);
        this.yScale.domain(yRange);
        this.yMap = (d) => {
            return this.yScale(this.yValue(d));
        };

    }

    public xOriginalValue(d) {

        return d[this.xdim];

    }


    public yOriginalValue(d) {

        return d[this.ydim];
    }



    public dimOriginalValueConsideringBinning(dim) {

        if (!dim) {

            return (d) => {
                return '';
            };
        }

        if (this.dimSetting[dim].isBinned) {

            return (d) => {

                return +this.dimSetting[dim].binnedData[d.id];
            };


        } else {
            return (d) => {

                return d[dim];
            };
        }
    }



    public colorOriginalValue(d) {

        return d[this.config.colorDim];
    }



    public calculatePositionOfNodes() {
        //debugger;

        if (this.config.isGather === 'gather') {

            this.calculatePositionOfNodesForGather();

        }

        this.xValue = this.getPositionValueFunc(this.xdim);
        this.yValue = this.getPositionValueFunc(this.ydim);


    }

    public calculatePositionOfNodesForSameOrdDimGather() {
        //debugger;

        let clusterSize = this.getClusterBox();
        let range, height;


        range = this.yScale.range();
        height = range[0] - range[1];
        this.getOptimalBinSize(this.ydim, '', clusterSize.widthOfBox, height);

        this.updateYScaleForSameOrdDimGather();
        // calculatePositionOfCluster(this.xdim);

        this.xValue = this.getPositionValueFunc('');
        this.yValue = this.getPositionValueFunc(this.ydim);


    }

    public calculatePositionOfNodesForGather() {

        let typeOfXYDim = this.findTypeOfXYDim();

        if (typeOfXYDim === 'NomNom') {

            this.calculatePositionOfNodesForNomNomGather();

        } else if (typeOfXYDim === 'OrdOrd') {

            this.calculatePositionOfNodesForOrdOrdGather();

        } else {
            //Only one of them are ordinal -> binned gatherplot

            this.calculatePositionOfNodesForBinnedGather();

        }
    }

    public calculatePositionOfNodesForOrdOrdGather() {

        let typeOfXYDim = this.findTypeOfXYDim();
        let clusterSize = this.getClusterBox();
        let range, height;

        range = this.xScale.range();

        this.calculatePositionOfCluster(this.xdim);
        this.calculatePositionOfCluster(this.ydim);

    }

    public calculatePositionOfNodesForBinnedGather() {

        let typeOfXYDim = this.findTypeOfXYDim();
        let clusterSize = this.getClusterBox();
        let range, height;

        if (typeOfXYDim === 'XNomYOrd') {
            range = this.yScale.range();
            height = range[0] - range[1];
            this.getOptimalBinSize(this.ydim, this.xdim, clusterSize.widthOfBox, height);

            this.updateYScale();
            this.calculatePositionOfCluster(this.xdim);
        } else if (typeOfXYDim === 'XOrdYNom') {
            range = this.xScale.range();
            height = range[1] - range[0];
            this.getOptimalBinSize(this.xdim, this.ydim, clusterSize.heightOfBox, height);

            this.updateXScale();
            this.calculatePositionOfCluster(this.ydim);
        } else {


            this.calculatePositionOfCluster(this.xdim);

            this.calculatePositionOfCluster(this.ydim);


        }

    }



    public updateYScale() {

        let yRange = this.getExtentFromCalculatedPointsForBinnedGather(this.ydim);

        this.yScale = d3.scaleLinear().range([this.height, 0]);
        this.yScale.domain(yRange);
        this.yMap = (d) => {
            return this.yScale(this.yValue(d));
        };

    }

    public updateYScaleForSameOrdDimGather() {

        let yRange = this.getExtentFromCalculatedPointsForBinnedGather(this.ydim);

        this.yScale.domain(yRange);
        this.yMap = (d) => {
            return this.yScale(this.yValue(d));
        };

    }

    public updateXScale() {

        let xRange = this.getExtentFromCalculatedPointsForBinnedGather(this.xdim);

        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.xScale.domain(xRange);
        this.xMap = (d) => {
            return this.xScale(this.xValue(d));
        };

    }

    public getOptimalBinSize(ordDim, nomDim, norDimLength, ordDimLength) {

        let numBin = Math.floor(ordDimLength / this.maxDotSize);

        let dotSize = this.maxDotSize;

        let maxCrowdedBinCount = this.getMaxCrowdedBinCount(ordDim, nomDim, numBin);

        let loopCount = 0;

        let increment = numBin;
        let previousIncrement = 1;

        while (true) {


            if ((maxCrowdedBinCount) * dotSize > norDimLength) {

                increment = previousIncrement * 2;

            } else {

                increment = Math.round(previousIncrement * (-0.5));

            }

            numBin = numBin + increment;

            previousIncrement = Math.abs(increment);


            if (Math.abs(increment) < 2) {

                break;
            }

            maxCrowdedBinCount = this.getMaxCrowdedBinCount(ordDim, nomDim, numBin);
            dotSize = ordDimLength / numBin;

            loopCount = loopCount + 1;
        }



        console.log(loopCount + ': NumBin = ' + numBin);

        console.log(loopCount + ': increment = ' + increment);


        console.log(loopCount + ': maxCrowdedBinCount = ' + this.getMaxCrowdedBinCount(ordDim, nomDim, numBin));

        numBin = numBin + 1;

        this.doBinningAndSetKeys(ordDim, numBin);

    }

    public getMaxCrowdedBinCount(ordDim, nomDim, binCount) {

        let values = this.data.map((d) => {
            return +d[ordDim];
        });

        let ordinalScaleForGather = d3.scaleLinear().domain(d3.extent(values));


        let nestedData = d3.nest()
            .key((d) => {
                return d[nomDim];
            })
            .entries(this.data);

        let maxValues = nestedData.map((d) => {

            let values = d.values.map((d) => {
                return +d[ordDim];
            });

            let data = d3.histogram()
                .thresholds(binCount)
                (values);

            // console.log(data.bins());

            return d3.max(data, (d: any) => {
                return +d.y;
            });
        });

        return d3.max(maxValues)+1;

    }

    public findTypeOfXYDim() {

        if (this.xdim === 'Null') {

            this.xdim = '';
            this.config.xdim = '';
        }

        if (this.ydim === 'Null') {

            this.ydim = '';
            this.config.ydim = '';
        }

        if (this.config.colorDim === 'Null') {

            this.config.colorDim = '';
        }


        let xDimType = this.getDimType(this.xdim);
        let yDimType = this.getDimType(this.ydim);

        if (xDimType === 'ordinal' && yDimType === 'ordinal') {

            if (this.xdim === this.ydim) {
                return 'SameOrd';
            } else {
                return 'OrdOrd';
            }
        } else if (xDimType !== 'ordinal' && yDimType !== 'ordinal') {
            return 'NomNom';
        } else if (xDimType === 'ordinal' && yDimType !== 'ordinal') {
            return 'XOrdYNom';
        } else if (xDimType !== 'ordinal' && yDimType === 'ordinal') {
            return 'XNomYOrd';
        }

    }

    public calculatePositionOfNodesForNomNomGather() {

        this.calculatePositionOfCluster(this.xdim);
        this.calculatePositionOfCluster(this.ydim);

    }

    public calculatePositionOfCluster(dim) {

        if (!dim) {

            return;
        } else if (dim === 'Null') {
            return;
        }

        let keyValue = this.dimSetting[dim].keyValue;
        let increment;
        let previousIncrement;



        d3.map(keyValue).entries().forEach((d: any, i, all: any) => {


            if (i === 0) {
                if (d.value.isMinimized === true) {

                    d.value.calculatedPosition = this.marginClusterRatio;

                } else {

                    d.value.calculatedPosition = 0.5;

                }

                d.value.calculatedPosition = d.value.calculatedPosition;

                return;
            }

            if (all[i - 1].value.isMinimized === true) {

                previousIncrement = this.marginClusterRatio;

            } else {

                previousIncrement = 0.5;

            }


            if (d.value.isMinimized === true) {

                increment = this.marginClusterRatio;

            } else {

                increment = 0.5;

            }

            d.value.calculatedPosition = all[i - 1].value.calculatedPosition + increment + previousIncrement;

        });

    }

    public calculatePositionOfClusterForBinnedGather(dim) {


        let keyValue = this.dimSetting[dim].keyValue;

        let keys = Object.keys(keyValue);

        keys.sort((a: any, b: any) => {
            return a - b;
        });

        for (let i = 0; i < keys.length; i++) {

            keyValue[keys[i]].value = <any>{};

            keyValue[keys[i]].value.calculatedPosition = i + 0.5;
        }

    }


    public getPositionValueFunc(dimName) {

        if (!dimName) {

            return (d) => {
                return 0;
            };
        }

        let dimType = this.dimSetting[dimName].dimType;
        let dimNameClosure = dimName;

        // Follow the dimValue branch logic
        //                  Scatter         Jitter       Gather
        // nominal           sortedID      sortedID       calculatedID
        // SemiOrdi         sortedID       sortedID       calculatedID
        // ordinal           orig          orig           calculatedIDFromBin

        let calculatedPositionValueFunc = (d) => {
            return this.dimSetting[dimNameClosure].keyValue[d[dimNameClosure]].calculatedPosition;
        };

        let origValueFunc = (d) => {

            return +d[dimNameClosure];
        };

        let calculatedPositionWithBinValueFunc = (d) => {
            let binKey = +this.dimSetting[dimNameClosure].binnedData[d.id];
            if (!this.dimSetting[dimNameClosure].keyValue[binKey]) {

                console.log(binKey);
            }

            let positionWithBinKey = this.dimSetting[dimNameClosure].keyValue[binKey].calculatedPosition;

            return +positionWithBinKey;
        };

        let sortedPositionValueFunc = (d) => {
            return this.dimSetting[dimNameClosure].keyValue[d[dimNameClosure]].sortedID;
        };

        if (dimType === 'nominal') {

            if (this.config.isGather === 'gather') {

                return calculatedPositionValueFunc;
            } else {

                return sortedPositionValueFunc;
            }

        } else if (dimType === 'semiOrdinal') {

            if (this.config.isGather === 'gather') {

                return calculatedPositionValueFunc;

            } else {

                return sortedPositionValueFunc;
            }

        } else if (dimType === 'ordinal') {


            if (this.config.isGather === 'gather') {
                return calculatedPositionWithBinValueFunc;

            } else {
                return origValueFunc;
            }

        } else {

            console.log('Unsupported DimName in getDimValueFunc');
        }

    }



    public calculateOffsetOfNodes() {

        if (this.config.isGather === 'scatter') {

            this.setOffsetOfNodesForScatter();

        } else if (this.config.isGather === 'jitter') {

            this.setOffsetOfNodesForJitter();

        } else if (this.config.isGather === 'gather') {


            this.setOffsetOfNodesForGather();

        }

    }

    public calculateOffsetOfNodesForSameOrdDimGather() {


        this.setOffsetOfNodesForGatherForSameOrdDimGather();


    }

    public setOffsetOfNodesForScatter() {

        this.data.forEach((d) => {

            d.XOffset = 0;
            d.YOffset = 0;

        });

        this.assignSizeOfNodesForScatterAndJitter();

    }

    public assignSizeOfNodesForScatterAndJitter() {



        this.data.forEach((d) => {

            d.nodeWidth = this.maxDotSize;
            d.nodeHeight = this.maxDotSize;

        });
    }

    public setOffsetOfNodesForJitter() {


        let SDforJitter = this.getSDforJitter();

        let xNormalGenerator = d3.randomNormal(0, SDforJitter.xSD);
        let yNormalGenerator = d3.randomNormal(0, SDforJitter.ySD);

        this.data.forEach((d) => {


            d.XOffset = xNormalGenerator();
            d.YOffset = yNormalGenerator();

        });

        this.assignSizeOfNodesForScatterAndJitter();

    }

    public setOffsetOfNodesForGather() {

        this.makeNestedData();

        this.assignClusterIDOfNodes();
        this.updateClusterSizeInNestedData();
        this.getNodesSizeAndOffsetPosition();
        // assignOffsetForGather();

    }

    public setOffsetOfNodesForGatherForSameOrdDimGather() {

        this.makeNestedDataForSameOrdDimGather();

        this.assignClusterIDOfNodes();
        this.updateClusterSizeInNestedData();
        this.getNodesSizeAndOffsetPosition();
        // assignOffsetForGather();

    }

    public makeNestedData() {


        // debugger;

        let xOriginalValueWithBinning = this.dimOriginalValueConsideringBinning(this.xdim);

        let yOriginalValueWithBinning = this.dimOriginalValueConsideringBinning(this.ydim);

        this.nest = d3.nest()
            .key(xOriginalValueWithBinning)
            .key(yOriginalValueWithBinning)
            .sortValues(this.sortFuncByColorDimension())
            .entries(this.data);


    }

    public makeNestedDataForSameOrdDimGather() {


        // debugger;

        let xOriginalValueWithBinning = this.dimOriginalValueConsideringBinning('');

        let yOriginalValueWithBinning = this.dimOriginalValueConsideringBinning(this.ydim);

        this.nest = d3.nest()
            .key(xOriginalValueWithBinning)
            .key(yOriginalValueWithBinning)
            .sortValues(this.sortFuncByColorDimension())
            .entries(this.data);


    }

    public assignClusterIDOfNodes() {

        this.assignClusterIDOfNodesInTwoKeyNestedItems(this.nest);

    }

    public assignClusterIDOfNodesInTwoKeyNestedItems(nest) {

        nest.forEach((d, i, j) => {

            d.values.forEach((d, i, j) => {

                d.values.forEach((d, i, j) => {

                    d.clusterID = i;

                });

            });

        });


    }

    public assignClusterIDOfNodesInOneKeyNestedItems(nest) {

        nest.forEach((d, i, j) => {

            d.values.forEach((d, i, j) => {

                d.clusterID = i;


            });

        });


    }

    public updateClusterSizeInNestedData() {

        this.nest.forEach((d, i, j) => {

            d.values.forEach((d, i, j) => {

                d.numOfElement = d.values.length;

            });

        });


    }

    public sortFuncByColorDimension() {

        let colorDim = this.config.colorDim;

        if (!colorDim) {
            return (a, b) => {
                return a;
            };
        } else {

            // debugger;

            if (this.isDimTypeNumerical(this.dimSetting[colorDim].dimType)) {

                return this.numericalDimSortFunc(colorDim);

            } else {

                return this.nominalDimSortFunc(colorDim);

            }


        }

    }

    public nominalDimSortFunc(dim) {

        let tempDimSetting = this.dimSetting[dim];

        return (a, b) => {
            let myDim = dim;
            return tempDimSetting.keyValue[a[myDim]].sortedID - tempDimSetting.keyValue[b[myDim]].sortedID;
        };

    }

    public numericalDimSortFunc(dim) {

        return (a, b) => {
            return a[dim] - b[dim];
        };
    }

    public isDimTypeNumerical(dimType) {

        if (dimType === 'nominal') {

            return false;

        } else if (dimType === 'ordinal' || dimType === 'semiOrdinal') {

            return true;
        } else {

            alert('Unidentified dimension type');
        }
    }

    public getClusterBox() {

        let Xmargin, Ymargin;
        let typeOfXYDim = this.findTypeOfXYDim();

        if (typeOfXYDim === 'NomNom') {

            Xmargin = this.marginClusterRatio;
            Ymargin = this.marginClusterRatio;
        } else if (typeOfXYDim === 'XNomYOrd') {

            Xmargin = this.marginClusterRatio;
            Ymargin = 0;
        } else if (typeOfXYDim === 'XOrdYNom') {

            Xmargin = 0;
            Ymargin = this.marginClusterRatio;
        } else if (typeOfXYDim === 'OrdOrd') {

            Xmargin = this.marginClusterRatio;
            Ymargin = this.marginClusterRatio;

        } else {

            Xmargin = 0;
            Ymargin = 0;
        }

        return {
            widthOfBox: this.xScale(1 - 2 * Xmargin) - this.xScale(0),
            heightOfBox: this.yScale(0) - this.yScale(1 - 2 * Ymargin)
        };

    }


    public getNodesSizeForAbsolute() {

        let maxNumElementInCluster = this.getClusterWithMaximumPopulation();
        // console.log('maxNumElementInCluster = ' + maxNumElementInCluster )
        let box = this.getClusterBox();
        let size = this.calculateNodesSizeForAbsolute(box, maxNumElementInCluster);

        return size;

    }


    public getNodesSizeAndOffsetPosition() {

        this.nest.forEach((d, i, j) => {

            let xKey = d.key;

            d.values.forEach((d, i, j) => {

                let yKey = d.key;

                this.assignNodesOffsetByCluster(d.values, xKey, yKey);

            });

        });


    }


    public assignNodesOffsetByCluster(cluster, xKey, yKey) {

        let box = this.getClusterBox();

        this.assignNodesOffsetConsideringAspectRatio(cluster, box)


        this.updateNodesOffsetForMinimized(cluster, xKey, yKey);
        this.updateNodesSizeForMinimized(cluster, xKey, yKey);

    }

    public assignNodesOffsetConsideringAspectRatio(cluster, box) {

        if (box.widthOfBox > box.heightOfBox) {

            this.assignNodesOffsetHorizontallyByCluster(cluster, box);

        } else {

            this.assignNodesOffsetVerticallyByCluster(cluster, box);
        }



    }

    public updateNodesSizeForMinimized(cluster, xKey, yKey) {

        if (this.isMinimized(this.xdim, xKey)) {

            this.makeAbsoluteSize(cluster, 'nodeWidth');
        }

        if (this.isMinimized(this.ydim, yKey)) {

            this.makeAbsoluteSize(cluster, 'nodeHeight');
        }

    }

    public updateNodesOffsetForMinimized(cluster, xKey, yKey) {

        if (this.isMinimized(this.xdim, xKey)) {

            this.makeZeroOffset(cluster, 'XOffset');

        }

        if (this.isMinimized(this.ydim, yKey)) {

            this.makeZeroOffset(cluster, 'YOffset');
        }



    }

    public isMinimized(dim, key) {

        if (!dim) {

            return false;
        }

        if (!key) {

            return false;
        }

        if (!this.config.isInteractiveAxis) {

            return false;
        }

        return (this.dimSetting[dim].keyValue[key].isMinimized);
    }

    public makeZeroOffset(cluster, offset) {

        cluster.forEach((d) => {

            d[offset] = 0;

        });
    }

    public makeAbsoluteSize(cluster, nodeSize) {

        let absoulteSize = this.getNodesSizeForAbsolute();

        cluster.forEach((d) => {

            d[nodeSize] = absoulteSize;

        });
    }




    public assignNodesOffsetLongShortEdge(longEdge, shortEdge, cluster) {

        let numElement = this.getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, cluster.length);
        if (this.isThemeRiverCondition(longEdge, shortEdge, numElement)) {

            numElement = this.getNumOfElementForThemeRiver(longEdge, shortEdge, cluster.length);
            if (numElement.numElementInShortEdge === 2) {
                console.log('Hey');
            }
        }
        let nodeSize = this.getNodeSizeAbsoluteOrRelative(longEdge, shortEdge, numElement.numElementInLongEdge, numElement.numElementInShortEdge);
        let offsetForCenterPosition = this.calculateOffsetForCenterPosition(nodeSize.lengthInLongEdge, nodeSize.lengthInShortEdge, numElement.numElementInLongEdge, numElement.numElementInShortEdge);


        return {
            numElement: numElement,
            nodeSize: nodeSize,
            offsetForCenterPosition: offsetForCenterPosition
        };


    }

    public assignNodesOffsetLongShortEdgeLens(longEdge, shortEdge, cluster, size) {

        let numElement = this.getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, cluster.length);
        if (this.isThemeRiverCondition(longEdge, shortEdge, numElement)) {

            numElement = this.getNumOfElementForThemeRiver(longEdge, shortEdge, cluster.length);
        }
        let nodeSize = this.getNodeSizeAbsoluteOrRelative(longEdge, shortEdge, numElement.numElementInLongEdge, numElement.numElementInShortEdge);
        let offsetForCenterPosition = this.calculateOffsetForCenterPosition(nodeSize.lengthInLongEdge, nodeSize.lengthInShortEdge, numElement.numElementInLongEdge, numElement.numElementInShortEdge);


        return {
            numElement: numElement,
            nodeSize: nodeSize,
            offsetForCenterPosition: offsetForCenterPosition
        };


    }

    public isThemeRiverCondition(longEdge, shortEdge, numElement) {

        if (longEdge / shortEdge > 3) {

            return true;
        } else {

            return false;
        }
    }

    public getNumOfElementForThemeRiver(longEdge, shortEdge, numElement) {

        let numElementInShortEdge = Math.ceil(shortEdge / this.getNodesSizeForAbsolute());


        if (numElementInShortEdge == 2 && this.getNodesSizeForAbsolute() < 1) {

            numElementInShortEdge = 1;


        }

        let numElementInLongEdge = Math.ceil(numElement / numElementInShortEdge);


        return {
            numElementInShortEdge: numElementInShortEdge,
            numElementInLongEdge: numElementInLongEdge
        };


    }

    public getNodeSizeAbsoluteOrRelative(longEdge, shortEdge, numElementInLongEdge, numElementInShortEdge) {

        let lengthInLongEdge, lengthInShortEdge;

        if (this.config.relativeMode === 'absolute') {

            lengthInLongEdge = this.getNodesSizeForAbsolute();
            lengthInShortEdge = lengthInLongEdge;

        } else {
            lengthInLongEdge = longEdge / numElementInLongEdge;
            lengthInShortEdge = shortEdge / numElementInShortEdge;
        }

        return {
            lengthInLongEdge: lengthInLongEdge,
            lengthInShortEdge: lengthInShortEdge
        };

    }

    public handleOffsetRectLensHorizontally(cluster, box, size) {

        let nodeHeight = size;
        let nodeWidth = size;

        let numOfElement = this.getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(box.widthOfBox, box.heightOfBox, cluster.length);
        let numElementInShortEdge = numOfElement.numElementInShortEdge;
        let numElementInLongEdge = numOfElement.numElementInLongEdge;
        let offsetInShortEdge = nodeHeight * numElementInShortEdge / 2;
        let offsetInLongEdge = nodeWidth * numElementInLongEdge / 2;

        cluster.forEach((d, i, j) => {

            d.nodeWidthLens = nodeWidth;
            d.nodeHeightLens = nodeHeight;




            d.YOffsetLens = (d.clusterID % numElementInShortEdge) * nodeHeight - offsetInShortEdge + nodeHeight;
            d.XOffsetLens = Math.floor(d.clusterID / numElementInShortEdge) * nodeWidth - offsetInLongEdge;

        });

    }

    public handleOffsetRectLensVertically(cluster, box, size) {

        let nodeHeight = size;
        let nodeWidth = size;

        let numOfElement = this.getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(box.heightOfBox, box.widthOfBox, cluster.length);
        let numElementInShortEdge = numOfElement.numElementInShortEdge;
        let numElementInLongEdge = numOfElement.numElementInLongEdge;
        let offsetInShortEdge = nodeWidth * numElementInShortEdge / 2;
        let offsetInLongEdge = nodeHeight * numElementInLongEdge / 2;

        cluster.forEach((d, i, j) => {

            d.nodeHeightLens = nodeHeight;
            d.nodeWidthLens = nodeWidth;

            d.XOffsetLens = (d.clusterID % numElementInShortEdge) * nodeWidth - offsetInShortEdge;
            d.YOffsetLens = Math.floor(d.clusterID / numElementInShortEdge) * nodeHeight - offsetInLongEdge + nodeHeight;

        });

    }

    public handleOffsetHistLensHorizontally(cluster, box, size) {

        let nodeHeight = size;
        let nodeWidth = size;
        let numElementInShortEdge = Math.round(box.heightOfBox / size);
        let numElementInLongEdge = Math.round(box.widthOfBox / size);
        let offsetInShortEdge = nodeHeight * numElementInShortEdge / 2;
        let offsetInLongEdge = nodeWidth * numElementInLongEdge / 2;

        cluster.forEach((d, i, j) => {

            d.nodeWidthLens = nodeWidth;
            d.nodeHeightLens = nodeHeight;

            d.YOffsetLens = (d.clusterID % numElementInShortEdge) * nodeHeight - offsetInShortEdge + nodeHeight;
            d.XOffsetLens = Math.floor(d.clusterID / numElementInShortEdge) * nodeWidth - offsetInLongEdge;

        });

    }

    public handleOffsetHistLensVertically(cluster, box, size) {

        let nodeHeight = size;
        let nodeWidth = size;
        let numElementInShortEdge = Math.round(box.widthOfBox / size);
        let numElementInLongEdge = Math.round(box.heightOfBox / size);
        let offsetInShortEdge = nodeHeight * numElementInShortEdge / 2;
        let offsetInLongEdge = nodeWidth * numElementInLongEdge / 2;

        cluster.forEach((d, i, j) => {

            d.nodeWidthLens = nodeWidth;
            d.nodeHeightLens = nodeHeight;

            d.XOffsetLens = (d.clusterID % numElementInShortEdge) * nodeWidth - offsetInShortEdge;
            d.YOffsetLens = Math.floor(d.clusterID / numElementInShortEdge) * nodeHeight - offsetInLongEdge + nodeHeight;

        });

    }


    public assignNodesOffsetHorizontallyByCluster(cluster, box) {

        let offsetAndSizeInfo = this.assignNodesOffsetLongShortEdge(box.widthOfBox, box.heightOfBox, cluster);

        let nodeHeight = offsetAndSizeInfo.nodeSize.lengthInShortEdge;
        let nodeWidth = offsetAndSizeInfo.nodeSize.lengthInLongEdge;
        let numElementInShortEdge = offsetAndSizeInfo.numElement.numElementInShortEdge;
        let numElementInLongEdge = offsetAndSizeInfo.numElement.numElementInLongEdge;
        let offsetInShortEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInShortEdge;
        let offsetInLongEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInLongEdge;

        cluster.forEach((d, i, j) => {

            d.nodeWidth = nodeWidth;
            d.nodeHeight = nodeHeight;




            d.YOffset = (d.clusterID % numElementInShortEdge) * nodeHeight - offsetInShortEdge + nodeHeight;
            d.XOffset = Math.floor(d.clusterID / numElementInShortEdge) * nodeWidth - offsetInLongEdge;

        });

    }

    public assignNodesOffsetVerticallyByCluster(cluster, box) {

        let offsetAndSizeInfo = this.assignNodesOffsetLongShortEdge(box.heightOfBox, box.widthOfBox, cluster);

        let nodeHeight = offsetAndSizeInfo.nodeSize.lengthInLongEdge;
        let nodeWidth = offsetAndSizeInfo.nodeSize.lengthInShortEdge;
        let numElementInShortEdge = offsetAndSizeInfo.numElement.numElementInShortEdge;
        let numElementInLongEdge = offsetAndSizeInfo.numElement.numElementInLongEdge;
        let offsetInShortEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInShortEdge;
        let offsetInLongEdge = offsetAndSizeInfo.offsetForCenterPosition.offsetInLongEdge;

        cluster.forEach((d, i, j) => {

            d.nodeHeight = nodeHeight;
            d.nodeWidth = nodeWidth;

            d.XOffset = (d.clusterID % numElementInShortEdge) * nodeWidth - offsetInShortEdge;
            d.YOffset = Math.floor(d.clusterID / numElementInShortEdge) * nodeHeight - offsetInLongEdge + nodeHeight;

        });

    }

    public calculateOffsetForCenterPosition(nodeLengthInLongEdge, nodeLengthInShortEdge, numElementInLongEdge, numElementInShortEdge) {

        let offsetInShortEdgeForCenterPosition;
        let offsetInLongEdgeForCenterPosition;

        offsetInShortEdgeForCenterPosition = numElementInShortEdge * nodeLengthInShortEdge / 2;
        offsetInLongEdgeForCenterPosition = numElementInLongEdge * nodeLengthInLongEdge / 2;

        return {
            offsetInShortEdge: offsetInShortEdgeForCenterPosition,
            offsetInLongEdge: offsetInLongEdgeForCenterPosition
        };
    }

    public getClusterWithMaximumPopulation() {

        return this.getClusterWithMaximumPopulationFromTwoKeyNestedItems(this.nest);
    }

    public getClusterWithMaximumPopulationFromTwoKeyNestedItems(nest) {

        return d3.max(nest, (d: any) => {

            return d3.max(d.values, (d: any) => {

                return d.numOfElement;
            });
        });

    }

    public getClusterWithMaximumPopulationFromOneKeyNestedItems(nest) {

        return d3.max(nest, (d: any) => {

            return d.values.length;
        });

    }

    public calculateNodesSizeForAbsolute(box, maxNumber) {

        if (box.widthOfBox > box.heightOfBox) {

            return this.calculateNodesSizeWithLongAndShortEdges(box.widthOfBox, box.heightOfBox, maxNumber);

        } else {

            return this.calculateNodesSizeWithLongAndShortEdges(box.heightOfBox, box.widthOfBox, maxNumber);
        }
    }

    public calculateNodesSizeWithLongAndShortEdges(longEdge, shortEdge, number) {


        let numElement = this.getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, number);

        return shortEdge / numElement.numElementInShortEdge;

    }

    public getNumOfElementInLongAndShortEdgeUsingAspectRatioKeeping(longEdge, shortEdge, number) {

        let numElementInShortEdge = 0,
            numElementInLongEdge,
            sizeNode, lengthCandidate;



        do {

            numElementInShortEdge++;
            sizeNode = shortEdge / numElementInShortEdge;
            lengthCandidate = sizeNode * number / numElementInShortEdge;

        } while (lengthCandidate > longEdge);

        numElementInLongEdge = Math.ceil(number / numElementInShortEdge);

        return {
            numElementInShortEdge: numElementInShortEdge,
            numElementInLongEdge: numElementInLongEdge
        };


    }



    public getSDforJitter() {

        let nominalBox = this.getClusterBox();
        let probFactor = 0.15;

        let xSD = nominalBox.widthOfBox * probFactor;
        let ySD = nominalBox.heightOfBox * probFactor;

        return {
            xSD: xSD,
            ySD: ySD
        };

    }



    public drawNodesInSVG() {

        this.getColorOfNodes();
        this.getShapeOfNodes();
        this.writeNodesInSVG();


    }

    public drawNodesInSVGForSameOrdDimGather() {

        this.getColorOfNodes();
        this.getShapeOfNodes();
        this.writeNodesInSVGForSameOrdDimGather();


    }

    public getColorOfNodes() {

        if (!this.config.colorDim) {
            this.color = this.colorNominal;
            return;
        }




        if (this.dimSetting[this.config.colorDim].dimType === 'ordinal') {

            let colorDomain = d3.extent(this.data, (d) => {
                return +d[this.config.colorDim];
            });

            this.colorScaleForHeatMap = d3.scaleLinear()
                .range([0x98c8fd, 0x08306b])
                .domain(colorDomain)
                .interpolate(d3.interpolateHsl) // tslint-disabled:line;

            this.color = this.colorScaleForHeatMap;
        } else {

            this.color = this.colorNominal;
        }

    }

    public getShapeOfNodes() {

    }

    public writeNodesInSVG() {
        // debugger;

        // this.nodeGroup.attr('transform', 'translate(' + margin + ',' + margin + ') rotate(0 80 660)');

        this.nodeGroup.attr('transform', 'translate(0,0) rotate(0 80 660)');


        this.nodeGroup.selectAll('.dot')
            .data(this.data, (d) => {
                return +d.id;
            })
            .style('fill', (d) => {
                return this.color(d[this.config.colorDim]);
            })
            .transition()
            .duration(1500)
            .attr('x', this.xMap.bind(this))
            .attr('y', this.yMap.bind(this))
            .attr('width', (d) => {
                // console.log(initialSquareLenth);
                return +d.nodeWidth;
            })
            .attr('height', (d) => {
                return +d.nodeHeight;
            })
            .attr('rx', (d) => {
                return this.round ? +5 : 0;
            })
            .attr('ry', (d) => {
                return this.round ? +5 : 0;
            })
            .attr('transform', (d, i) => {

                // if (d.cancer== 'Cancer') {
                //     console.log(height);
                // }
                return 'translate(' + (d.XOffset) + ',' + (-(d.YOffset)) + ') ';
            });

    }

    public writeNodesInSVGForSameOrdDimGather() {
        // debugger;



        this.nodeGroup.selectAll('.dot')
            .data(this.data, (d) => {
                return +d.id;
            })
            .style('fill', (d) => {
                return this.color(d[this.config.colorDim]);
            })
            .transition()
            .duration(0)
            .attr('x', this.xMap.bind(this))
            .attr('y', this.yMap.bind(this))
            .attr('width', (d) => {
                // console.log(initialSquareLenth);
                return +d.nodeWidth;
            })
            .attr('height', (d) => {
                return +d.nodeHeight;
            })
            .attr('rx', (d) => {
                return this.round ? +5 : 0;
            })
            .attr('ry', (d) => {
                return this.round ? +5 : 0;
            })
            .attr('transform', (d, i) => {

                // if (d.cancer== 'Cancer') {
                //     console.log(height);
                // }
                return 'translate(' + (d.XOffset) + ',' + (-(d.YOffset)) + ') ';
            });

        let angleRad = Math.atan(this.height / this.width);

        let angleDeg = 90 - angleRad * 180 / Math.PI;


        this.nodeGroup.attr('transform', ' translate(' + this.margin + ',' + this.margin + ')  rotate(' + angleDeg + ',' + '0' + ',' + this.yScale.range()[0] + ')');

    }

    public labelGenerator(dimName) {
        if (!dimName) {

            return (d) => {
                return '';
            };
        } else if ((this.dimSetting[dimName].dimType === 'ordinal')) {

            return (d, i) => {

                return +d;
            };
        } else if ((this.dimSetting[dimName].dimType === 'semiOrdinal')) {

            return (d, i) => {

                return d3.map(this.dimSetting[dimName].keyValue).keys()[i];
            };
        } else {

            return (d) => {

                return this.getKeys(dimName)[d];

            };
        }

    }

    public labelGeneratorForGather(dimName) {

        if (!dimName) {

            return (d) => {
                return '';
            };
        } else if (this.dimSetting[dimName].dimType === 'ordinal') {

            let binDistanceFormatter = d3.format('3,.1f');

            return (d, i) => {

                let binValue = d3.map(this.dimSetting[dimName].keyValue).keys()[i];

                return binDistanceFormatter(+binValue) + '\u00B1'
                + binDistanceFormatter(+this.dimSetting[dimName].halfOfBinDistance);
            };
        } else if (this.dimSetting[dimName].dimType === 'semiOrdinal') {

            return (d, i) => {

                return d3.map(this.dimSetting[dimName].keyValue).keys()[i];
            };
        } else {

            return (d, i) => {

                return this.getKeys(dimName)[i];

            };
        }

    }

    public labelGeneratorForOrdinalGather(dim) {

        let keyValue = this.dimSetting[dim].keyValue;

        let keys = Object.keys(keyValue)
            .sort((a: any, b: any) => {
                return a - b;
            });

        let binDistanceFormatter = d3.format('3,.0f');


        return (d, i) => {

            return binDistanceFormatter(+keys[d]);

        };


    }

    public tickGenerator(dimName) {

        if (!dimName) {
            return 0;
        } else if (this.dimSetting[dimName].dimType === 'ordinal') {

            return 8;

        } else {

            return this.getKeys(dimName).length;
        }
    }

    public tickValueGeneratorForGather(dimName) {

        if (!dimName) {
            return [];

        }
        return this.getCalculatedPositions(dimName);

    }

    public tickValueGeneratorForSameOrdGather(dimName) {

        if (!dimName) {
            return [];

        }


        let originalPositions = this.getCalculatedPositions(dimName);


        let samplingRate = this.getSamplingRateForOrdinalGather(dimName);

        let sampledPositions = originalPositions.filter((d, i) => {
            return (i % samplingRate === 0);
        });



        sampledPositions = sampledPositions.map((d) => {
            return d + Math.floor(samplingRate / 0.5);
        })

        sampledPositions.pop();

        return sampledPositions;

    }

    public tickValueGeneratorForOrdinalGather(dimName) {

        if (!dimName) {
            return [];

        }


        let originalPositions = this.getCalculatedPositions(dimName);


        let samplingRate = this.getSamplingRateForOrdinalGather(dimName);

        let sampledPositions = originalPositions.filter((d, i) => {
            return (i % samplingRate === 0);
        });



        sampledPositions = sampledPositions.map((d) => {
            return d + Math.floor(samplingRate / 2);
        })

        sampledPositions.pop();

        return sampledPositions;

    }

    public getSamplingRateForOrdinalGather(dimName) {

        let originalPositions = this.getCalculatedPositions(dimName);

        let dimLength = originalPositions.length;

        return Math.floor(dimLength / 7);

    }


    public drawAxes() {

        if (this.isSameOrdDimGather()) {

            this.drawAxesForSameOrdDimGather();
        } else {

            this.drawAxesForDifferentDim();
        }

    }

    public drawAxesForDifferentDim() {

        this.drawAxesLinesAndTicks();
        this.drawAxesLabel();

    }

    public drawAxesForSameOrdDimGather() {

        this.restoreXYScaleForSameOrdDimGather();

        this.drawAxesLinesAndTicksForSameOrdDimGather();
        this.drawAxesLabel();
        this.setStylesForAxesAndTicks();

    }

    public drawAxesLinesAndTicks() {

        if (this.config.isGather === 'gather') {

            this.drawAxesLinesAndTicksForGather();

        } else {

            this.drawAxesLinesAndTicksForScatter();
        }

        this.setStylesForAxesAndTicks();


    }

    public setStylesForAxesAndTicks() {

        this.svg.selectAll('.domain')
            .style('stroke', 'black')
            .style('stroke-width', 2);

        this.svg.selectAll('.bracket')
            .style('stroke', 'black')
            .style('stroke-width', 1);


    }

    public drawAxesLinesAndTicksForScatter() {

        this.svg.selectAll('.axis').remove();

        this.drawXAxisLinesAndTicksForScatter();
        this.drawYAxisLinesAndTicksForScatter();

    }

    public drawAxesLinesAndTicksForSameOrdDimGather() {

        this.svg.selectAll('.axis').remove();

        this.drawXAxisLinesAndTicksForSameOrdDimGather();
        this.drawYAxisLinesAndTicksForSameOrdDimGather();
    }

    public drawXAxisLinesAndTicksForScatter() {

        this.xAxis = d3.axisBottom(this.xScale)
            .ticks(this.tickGenerator(this.xdim)/*, */)
            .tickFormat(this.labelGenerator(this.xdim));

        this.xAxisNodes = this.svgGroup.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (this.height) + ')')
            .call(this.xAxis);

        this.xAxisNodes.selectAll('text')
            .style('font-size', 12);


        this.svg.selectAll('.x .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'black');
    }

    public drawYAxisLinesAndTicksForScatter() {

        this.yAxis = d3.axisLeft(this.yScale)
            .ticks(this.tickGenerator(this.ydim)/*, */)
            .tickFormat(this.labelGenerator(this.ydim));

        this.yAxisNodes = this.svgGroup.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis);

        this.yAxisNodes.selectAll('text')
            .style('font-size', 12);

        this.svg.selectAll('.y .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'black');

    }




    public drawXAxisLinesAndTicksForOrdinalGather() {

        let ticks = this.tickValueGeneratorForOrdinalGather(this.xdim);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickValues(ticks)
            .tickFormat(this.labelGeneratorForOrdinalGather(this.xdim))
            .tickSize(0); // Provides 0 size ticks at center position for gather

        this.xAxisNodes = this.svgGroup.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (this.height) + ')')
            .call(this.xAxis);

        this.xAxisNodes.selectAll('text')
            .style('font-size', 12);

        this.svg.selectAll('.x .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'black');

    }

    public drawYAxisLinesAndTicksForOrdinalGather() {

        let ticks = this.tickValueGeneratorForOrdinalGather(this.ydim);

        this.yAxis = d3.axisLeft(this.yScale)
            .tickValues(ticks)
            .tickFormat(this.labelGeneratorForOrdinalGather(this.ydim))
            .tickSize(0); // Provides 0 size ticks at center position for gather

        this.yAxisNodes = this.svgGroup.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis);

        this.yAxisNodes.selectAll('text')
            .style('font-size', 12);

        this.svg.selectAll('.y .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'black');

    }

    public drawXAxisLinesAndTicksForSameOrdDimGather() {

        let ticks = this.tickValueGeneratorForOrdinalGather(this.xdim);

        let calculatedPositions = this.getCalculatedPositions(this.xdim);

        let domain = [calculatedPositions[0], calculatedPositions[calculatedPositions.length - 1]];

        let xScaleForSameOrdDimGather = d3.scaleLinear().domain(domain).range([0, this.width]);

        this.xAxis = d3.axisBottom(xScaleForSameOrdDimGather)
            .tickValues(ticks)
            .tickFormat(this.labelGeneratorForOrdinalGather(this.xdim))
            .tickSize(0); // Provides 0 size ticks at center position for gather

        this.xAxisNodes = this.svgGroup.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (this.height) + ')')
            .call(this.xAxis);

        this.xAxisNodes.selectAll('text')
            .style('font-size', 12);

        this.svg.selectAll('.x .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'black');

    }

    public drawYAxisLinesAndTicksForSameOrdDimGather() {


        let ticks = this.tickValueGeneratorForOrdinalGather(this.ydim);

        let calculatedPositions = this.getCalculatedPositions(this.xdim);

        let domain = [calculatedPositions[0], calculatedPositions[calculatedPositions.length - 1]];


        let yScaleForSameOrdDimGather = d3.scaleLinear().domain(domain).range([this.height, 0])

         this.yAxis = d3.axisLeft(yScaleForSameOrdDimGather)
             .tickValues(ticks)
             .tickFormat(this.labelGeneratorForOrdinalGather(this.ydim))
             .tickSize(0); //Provides 0 size ticks at center position for gather

        this.yAxisNodes = this.svgGroup.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis);

        this.yAxisNodes.selectAll('text')
            .style('font-size', 12);

        this.svg.selectAll('.y .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'black');


    }



    //returns path string d for <path d='This string'>
    //a curly brace between x1,y1 and x2,y2, w pixels wide
    //and q factor, .5 is normal, higher q = more expressive bracket
    public makeCurlyBrace(x1, y1, x2, y2, w, q) {
        //Calculate unit vector
        let dx = x1 - x2;
        let dy = y1 - y2;
        let len = Math.sqrt(dx * dx + dy * dy);

        if (len === 0) {
            dx = 0;
            dy = 0;
        } else {
            dx = dx / len;
            dy = dy / len;
        }
        //Calculate Control Points of path,
        let qx1 = x1 + q * w * dy;
        let qy1 = y1 - q * w * dx;
        let qx2 = (x1 - .25 * len * dx) + (1 - q) * w * dy;
        let qy2 = (y1 - .25 * len * dy) - (1 - q) * w * dx;
        let tx1 = (x1 - .5 * len * dx) + w * dy;
        let ty1 = (y1 - .5 * len * dy) - w * dx;
        let qx3 = x2 + q * w * dy;
        let qy3 = y2 - q * w * dx;
        let qx4 = (x1 - .75 * len * dx) + (1 - q) * w * dy;
        let qy4 = (y1 - .75 * len * dy) - (1 - q) * w * dx;

        return ('M ' + x1 + ' ' + y1 +
            ' Q ' + qx1 + ' ' + qy1 + ' ' + qx2 + ' ' + qy2 +
            ' T ' + tx1 + ' ' + ty1 +
            ' M ' + x2 + ' ' + y2 +
            ' Q ' + qx3 + ' ' + qy3 + ' ' + qx4 + ' ' + qy4 +
            ' T ' + tx1 + ' ' + ty1);
    }

    public drawAxesLinesAndTicksForGather() {

        this.svg.selectAll('.axis').remove();

        this.drawXAxisLinesAndTicksForGather();
        this.drawYAxisLinesAndTicksForGather();

    }

    public drawXAxisLinesAndTicksForGather() {

        if (this.getDimType(this.xdim) !== 'ordinal' || this.findTypeOfXYDim() === 'OrdOrd') {

            this.drawXAxisLinesAndTicksForNominalGather();
        } else {

            this.drawXAxisLinesAndTicksForOrdinalGather();
        }

    }

    public drawYAxisLinesAndTicksForGather() {



        if (this.getDimType(this.ydim) !== 'ordinal' || this.findTypeOfXYDim() === 'OrdOrd') {

            this.drawYAxisLinesAndTicksForNominalGather();
        } else {

            this.drawYAxisLinesAndTicksForOrdinalGather();
        }


    }

    public drawXAxisLinesAndTicksForNominalGather() {

        this.xAxis = d3.axisBottom(this.xScale)
            .tickValues(this.tickValueGeneratorForGather(this.xdim))
            .tickFormat(this.labelGeneratorForGather(this.xdim))
            .tickSize(0); // Provides 0 size ticks at center position for gather

        this.svg.selectAll('.axis').remove();

        this.xAxisNodes = this.svgGroup.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (this.height) + ')')
            .call(this.xAxis);

        this.xAxisNodes.selectAll('text')
            .style('font-size', 10);

        d3.selectAll('.x .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'white');

        let xAxisBracketGroup = this.xAxisNodes.selectAll('.tick')
            .append('g')
            .attr('x', this.xBracketGroup.bind(this))
            .attr('y', 0)
            .attr('class', 'x controlButtonBracketGroup')
            .attr('width', this.widthBracketGroup.bind(this))
            .attr('height', 30)
            .attr('rx', 5)
            .attr('ry', 5);

        if (this.config.isInteractiveAxis) {
            xAxisBracketGroup
                .on('mouseover', function(d) {
                    d3.select(this).selectAll('rect')
                        .style('opacity', 0.7);
                    d3.select(this).selectAll('text')
                        .style('opacity', 0.7);
                })
                .on('mouseout', function(d) {


                    d3.select(this).selectAll('rect')
                        .transition()
                        .duration(1500)
                        .style('opacity', 0);

                    d3.select(this).selectAll('text')
                        .transition()
                        .duration(1500)
                        .style('opacity', 0);
                });



            xAxisBracketGroup.append('text')
                .style('opacity', 0)
                .style('fill', 'black')
                .attr('x', 0)
                .attr('y', 60 - 30)
                .attr('class', 'x controlButtonBracket')
                .attr('width', this.widthBracketGroup.bind(this))
                .attr('height', 10)
                .attr('dy', 10)
                .style('text-anchor', 'middle')
                .text('Minimize');

            xAxisBracketGroup.append('text')
                .style('opacity', 0)
                .style('fill', 'black')
                .attr('x', 0)
                .attr('y', 60 - 14)
                .attr('class', 'x controlButtonBracket')
                .attr('width', this.widthBracketGroup.bind(this))
                .attr('height', 10)
                .attr('dy', 10)
                .style('text-anchor', 'middle')
                .text('Maximize');
            //     });

            xAxisBracketGroup.append('rect')
                .style('opacity', 0)
                .style('fill', 'gray')
                .attr('x', this.xBracketGroup.bind(this))
                .attr('y', 60 - 32)
                .attr('class', 'x controlButtonBracket')
                .attr('width', this.widthBracketGroup.bind(this))
                .attr('height', 14)
                .attr('rx', 5)
                .attr('ry', 5)
                .on('mouseover', function(d) {
                    d3.select(this).style('fill', 'lightsteelblue');
                })
                .on('mouseout', function(d) {

                    d3.select(this).style('fill', 'lightgray')

                })
                .on('click', (d, i) => {

                    this.toggleMinimizeCluster(this.xdim, i);
                });

            xAxisBracketGroup.append('rect')
                .style('opacity', 0)
                .style('fill', 'gray')
                .attr('x', this.xBracketGroup.bind(this))
                .attr('y', 60 - 16)
                .attr('class', 'x controlButtonBracket')
                .attr('width', this.widthBracketGroup.bind(this))
                .attr('height', 14)
                .attr('rx', 5)
                .attr('ry', 5)
                .on('mouseover', function(d) {
                    d3.select(this).style('fill', 'green');
                })
                .on('mouseout', function(d) {

                    d3.select(this).style('fill', 'lightgray');

                })
                .on('click', (d, i) => {
                    // toggleMinimizeCluster(this.xdim, i);
                    this.toggleMaximizeCluster(this.xdim, i);
                });

        }

        xAxisBracketGroup.append('path')
            .attr('class', 'x bracket')
            .transition()
            .duration(500)
            .attr('d', this.pathXBracket.bind(this));

    }

    public drawYAxisLinesAndTicksForNominalGather() {

        this.yAxis = d3.axisLeft(this.yScale)
            .tickValues(this.tickValueGeneratorForGather(this.ydim))
            .tickFormat(this.labelGeneratorForGather(this.ydim))
            .tickSize(0); // Provides 0 size ticks at center position for gather

        this.yAxisNodes = this.svgGroup.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis);

        this.yAxisNodes.selectAll('text')
            .style('font-size', 10);

        d3.selectAll('.y .tick line')
            .style('stroke-width', 1)
            .style('stroke', 'white');

        let yAxisBracketGroup = this.yAxisNodes.selectAll('.tick')
            .append('g')
            .attr('x', 0)
            .attr('y', this.yBracketGroup.bind(this))
            .attr('class', 'y controlButtonBracketGroup')
            .attr('width', this.margin)
            .attr('height', this.heightBracketGroup.bind(this))
            .attr('rx', 5)
            .attr('ry', 5);

        if (this.config.isInteractiveAxis) {

            yAxisBracketGroup
                .on('mouseover', function(d) {
                    d3.select(this).selectAll('rect')
                        .style('opacity', 0.9);
                    d3.select(this).selectAll('text')
                        .style('opacity', 0.9);
                })
                .on('mouseout', function(d) {

                    d3.select(this).selectAll('rect')
                        .transition()
                        .duration(2000)
                        .style('opacity', 0);

                    d3.select(this).selectAll('text')
                        .transition()
                        .duration(2000)
                        .style('opacity', 0);
                });

            yAxisBracketGroup.append('text')
                .style('opacity', 0)
                .style('fill', 'black')
                .attr('x', 20)
                .attr('y', 0)
                .attr('class', 'y controlButtonBracket')
                .attr('width', 20)
                .attr('height', this.heightBracketGroup.bind(this))
                .attr('dy', 10)
                .style('text-anchor', 'left')
                .text('Minimize');

            yAxisBracketGroup.append('text')
                .style('opacity', 0)
                .style('fill', 'black')
                .attr('x', 110)
                .attr('y', 0)
                .attr('class', 'y controlButtonBracket')
                .attr('width', 10)
                .attr('height', this.heightBracketGroup.bind(this))
                .attr('dy', 10)
                .style('text-anchor', 'left')
                .text('Maximize');

            //     });

            yAxisBracketGroup.append('rect')
                .style('opacity', 0)
                .style('fill', 'gray')
                .attr('x', 10)
                .attr('y', -2)
                .attr('class', 'y controlButtonBracket')
                .attr('width', this.margin)
                .attr('height', 14)
                .attr('rx', 5)
                .attr('ry', 5)
                .on('mouseover', function(d) {
                    d3.select(this).style('fill', 'lightsteelblue');
                })
                .on('mouseout', function(d) {

                    d3.select(this).style('fill', 'lightgray');

                })
                .on('click', (d, i) => {

                    this.toggleMinimizeCluster(this.ydim, i);
                });

            yAxisBracketGroup.append('rect')
                .style('opacity', 0)
                .style('fill', 'gray')
                .attr('x', 100)
                .attr('y', -2)
                .attr('class', 'y controlButtonBracket')
                .attr('width', this.margin)
                .attr('height', 14)
                .attr('rx', 5)
                .attr('ry', 5)
                .on('mouseover', (d) => {
                    d3.select(this.el.nativeElement).style('fill', 'green');
                })
                .on('mouseout', (d) => {

                    d3.select(this.el.nativeElement).style('fill', 'lightgray');

                })
                .on('click', (d, i) => {
                    console.log(d);
                    // toggleMinimizeCluster(this.xdim, i);
                    this.toggleMaximizeCluster(this.ydim, i);
                });

        }

        this.yAxisNodes.selectAll('.tick')
            .append('path')
            .attr('class', 'y bracket')
            .transition()
            .duration(500)
            .attr('d', this.pathYBracket.bind(this));

    }

    public toggleMinimizeCluster(dim, i) {

        let key = <any> d3.map(this.dimSetting[dim].keyValue).values()[i];

        let keyObject = this.dimSetting[dim].keyValue[key.keyValue];

        keyObject.isMinimized = !keyObject.isMinimized;

        this.drawPlot();

    }

    public toggleMaximizeCluster(dim, i) {

        let key = <any> d3.map(this.dimSetting[dim].keyValue).values()[i];

        let keyObject = this.dimSetting[dim].keyValue[key.keyValue];

        keyObject.isMaximized = !keyObject.isMaximized;

        let keyValue = d3.map(this.dimSetting[dim].keyValue).values();

        if (keyObject.isMaximized === true) {

            keyValue.forEach((d: any) => {

                d.isMinimized = true;

            });

            keyObject.isMinimized = false;

        } else {
            keyValue.forEach((d: any) => {

                d.isMinimized = false;

            });

        }

        this.drawPlot();

    }

    public pathXBracket(d, i) {

        let dim = this.xdim;

        let key = this.getKeyFromIndex(dim, i);

        let length = this.lengthOfCluster(dim, key, this.xScale);

        if (length === 0) {
            return ('M 0 0 ' +
                ' L 0 ' + 10);
        } else {

            return this.makeCurlyBrace(-length / 2, 2, length / 2, 2, 10, 0.6);
        }
    }

    public pathYBracket(d, i) {

        let dim = this.ydim;

        let key = this.getKeyFromIndex(dim, i);

        let length = this.lengthOfCluster(dim, key, this.yScale);

        if (length === 0) {
            return ('M 0 0 ' +
                ' L -10 ' + 0);
        } else {

            return this.makeCurlyBrace(-2, length / 2, -2, -length / 2, 10, 0.6);
        }



    }


    public xBracket(d, i) {

        let dim = this.xdim;

        let key = this.getKeyFromIndex(dim, i);

        let length = this.lengthOfCluster(dim, key, this.xScale);

        return length / 2 * (-1);

    }

    public xBracketGroup(d, i) {

        let dim = this.xdim;

        let key = this.getKeyFromIndex(dim, i);

        let length = this.lengthOfClusterIncludingMargin(dim, key, this.xScale);

        return length / 2 * (-1);

    }

    public widthBracket(d, i) {

        let dim = this.xdim;

        let key = this.getKeyFromIndex(dim, i);

        let length = this.lengthOfCluster(dim, key, this.xScale);

        return length;

    }

    public widthBracketGroup(d, i) {

        let dim = this.xdim;

        let key = this.getKeyFromIndex(dim, i);

        let length = this.lengthOfClusterIncludingMargin(dim, key, this.xScale);

        return length;

    }

    public yBracket(d, i) {

        let dim = this.ydim;

        let key = this.getKeyFromIndex(dim, i);

        let length = -this.lengthOfCluster(dim, key, this.yScale);

        return length / 2 * (-1);

    }

    public yBracketGroup(d, i) {

        let dim = this.ydim;

        let key = this.getKeyFromIndex(dim, i);

        let length = -this.lengthOfClusterIncludingMargin(dim, key, this.yScale);

        return length / 2 * (-1);

    }

    public heightBracket(d, i) {

        let dim = this.ydim;

        let key = this.getKeyFromIndex(dim, i);

        let length = -this.lengthOfCluster(dim, key, this.yScale);

        return length;

    }

    public heightBracketGroup(d, i) {

        let dim = this.ydim;

        let key = this.getKeyFromIndex(dim, i);

        let length = -this.lengthOfClusterIncludingMargin(dim, key, this.yScale);

        return length;

    }


    public lengthOfCluster(dim, key, scale) {

        let keyObject = this.dimSetting[dim].keyValue[key];

        if (keyObject.isMinimized) {

            return 0;

        } else {

            return scale(1 - 2 * this.marginClusterRatio) - scale(0);
        }



    };

    public lengthOfClusterIncludingMargin(dim, key, scale) {

        let keyObject = this.dimSetting[dim].keyValue[key];

        if (keyObject.isMinimized) {

            return scale(2 * this.marginClusterRatio) - scale(0);

        } else {

            return scale(1) - scale(0);
        }



    }



    public getKeyFromIndex(dim, i) {
        if (!this.dimSetting[dim].keyValue) {

            //debugger;
            console.log(dim);
        }
        if (!d3.map(this.dimSetting[dim].keyValue).values()[i]) {

            //debugger;
            console.log(dim);
        }
        let temp = <any>d3.map(this.dimSetting[dim].keyValue).values()[i]
        return temp.keyValue;

    }


    public drawAxesLabel() {

        this.xAxisNodes
            .append('text')
            .attr('class', 'axislabel')
            .attr('x', this.width / 2)
            .attr('y', 56)
            .attr("fill", "black")
            .style('text-anchor', 'middle')
            .text(this.xdim);

        //Setup Y axis

        this.yAxisNodes
            .append('text')
            .attr('class', 'axislabel')
            .attr("fill", "black")
            .style('text-anchor', 'middle')
            .attr('transform', (d, i) => { // NEW
                let vert = this.height / 2; // NEW
                // let horz = -margin / 2; // NEW
                let horz = -60;
                return 'translate(' + horz + ',' + vert + ')rotate(-90)'; // NEW
            })
            .text(this.ydim);


        // yAxisNodes
        //     .append('text')
        //     .attr('class', 'axislabel')
        //     .text(findDisplayName(this.ydim))
        //     .attr('transform', (d, i) => { // NEW
        //         let vert = height / 2; // NEW
        //         let horz = -margin / 2; // NEW
        //         return 'translate(' + horz + ',' + vert + ')rotate(-90)'; // NEW
        //     });



    }

    public drawLegends() {

        this.resetLegends();

        if (!this.config.colorDim) {

            return;
        }

        let currentDimSetting = this.dimSetting[this.config.colorDim];

        if (currentDimSetting.dimType === 'ordinal') {

            this.drawHeatMapLegends();
        } else {

            this.drawNominalLegends();
        }
    }

    public resetLegends() {

        let legendGroup = this.svg.selectAll('.legend').remove();

    }

    public drawHeatMapLegends() {

        let colorDomain = d3.extent(this.data, (d) => {
            return +d[this.config.colorDim];
        });

        let widthHeatMap = 200;
        let heightHeatMap = 18;


        let xScaleForHeatMap = d3.scaleLinear()
            .domain(colorDomain)
            .rangeRound([this.width - 100, this.width + 100]);

        let values = d3.range(colorDomain[0], colorDomain[1], (colorDomain[1] - colorDomain[0]) / widthHeatMap);

        let g = this.svg.append('g')
            .attr('class', 'legend');



        let heatmap = g.selectAll('rect')
            .data(values)
            .enter().append('rect')
            .attr('x', xScaleForHeatMap)
            .attr('y', 20)
            .attr('width', 1)
            .attr('height', heightHeatMap)
            .style('fill', this.colorScaleForHeatMap);

        g.append('text')
            .attr('x', this.width + 12)
            .attr('y', 10)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text(this.config.colorDim);

        g.append('text')
            .attr('x', xScaleForHeatMap(values[0]))
            .attr('y', 50)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text(colorDomain[0]);

        g.append('text')
            .attr('x', xScaleForHeatMap(values[values.length - 1]))
            .attr('y', 50)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text(colorDomain[1]);

    }

    public drawNominalLegends() {


        let legendGroup = this.svg.selectAll('.legend')
            .data(this.getKeys(this.config.colorDim), (d) => {
                return d;
            });

        legendGroup.exit().remove();


        let legend = legendGroup.enter().append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => {
                return 'translate(0,' + (i * 20 + 5) + ')';
            });

        legend.append('rect')
            .attr('x', this.width - 18)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', (d) => {
                return this.color(d);
            });

        legend.append('text')
            .attr('x', this.width + 5)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'left')
            .text((d) => {
                return d;
            });



        let g = this.svg.append('g')
            .attr('class', 'legend');



        g.append('text')
            .attr('x', this.width - 24)
            .attr('y', 10)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(this.config.colorDim);




    } //End renderer
}
