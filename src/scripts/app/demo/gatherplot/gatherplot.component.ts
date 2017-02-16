/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ConfigService } from '../shared/config.service';
import { AccordionModule } from 'ng2-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import * as d3 from 'd3';

@Component({
  selector: 'my-demo',
  templateUrl: './gatherplot.component.html',
  providers: [ConfigService, DataService]
})

export class GatherplotComponent implements OnInit, OnDestroy {
  public configMatrix: any;
  public customCSV: any;
  public loadedData: any;
  public onlyNumbers: any;
//  public dimsum: any;
  public nomaConfig: any;
//  public context: any;
//  public nomaBorder: any;
//  public nomaShapeRendering: any;
  public alerts: any;
  public isPlotSelectFocused: any;
  public isScatter: any;
  public isRelativeSelectFocused: boolean;
  public isBinSizeFocused: boolean;
  public activeData: string;
  public isAdvancedOptionOpen: boolean;
  public isCarsOpen: boolean;
  private configSubscription: Subscription;
//  private roundSubscription: Subscription;
//  private borderSubscription: Subscription;
//  private shapeRenderingSubscription: Subscription;
//  private dimsumSubscription: Subscription;
//  private contextSubscription: Subscription;
//  private dataSubscription: Subscription;
  constructor(private configService: ConfigService, private dataService: DataService) {
}
  ngOnInit() {
    this.configSubscription = this.configService.config$
         .subscribe((config) => {
           //For getting default settings
           this.nomaConfig = config;
           this.isScatter = (config.isGather === 'scatter');
         });
//    this.borderSubscription = this.configService.border$
//         .subscribe(border => this.nomaBorder = border);
//    this.shapeRenderingSubscription = this.configService.shapeRendering$
//         .subscribe(shapeRendering => this.nomaShapeRendering = shapeRendering);
//    this.dimsumSubscription = this.configService.dimsum$
//         .subscribe(dimsum => this.dimsum = dimsum);
//    this.contextSubscription = this.configService.context$
//         .subscribe(context => this.context = context);

    this.changeActiveDataCars();
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.configSubscription.unsubscribe();
//    this.borderSubscription.unsubscribe();
//    this.shapeRenderingSubscription.unsubscribe();
//    this.dimsumSubscription.unsubscribe();
//    this.contextSubscription.unsubscribe();
  }

  private updateIsGather(isGather: string) {
    this.nomaConfig.isGather = isGather;
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  private updateLens(lens: string) {
    this.nomaConfig.lens = lens;
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  private updateXDim(xDim: string) {
    this.nomaConfig.xDim = xDim;
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  private updateYDim(yDim: string) {
    this.nomaConfig.yDim = yDim;
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  private updateColorDim(colorDim: string) {
    this.nomaConfig.colorDim = colorDim;
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  private updateRelativeMode(relativeMode: boolean) {
    this.nomaConfig.relativeMode = relativeMode ? 'relative' : 'absolute';
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  private validateAndUpdateBinsize(binSize: number)  {
    (binSize < 0 || binSize > 50) ? this.nomaConfig.binSize = 10 : this.nomaConfig.binSize = binSize;
    this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public addAlert(messageType, messageContent) {
      this.alerts.push({
          msg: messageContent,
          type: messageType
      });
  }

  public focusElement(element) {
      element = true;
  }

  public resetTutMsg() {
      this.alerts = [];
      this.isPlotSelectFocused = false;
      this.isRelativeSelectFocused = false;
      this.isBinSizeFocused = false;
  }

  public d3OnClick(item: any) {
      this.nomaConfig.xDim = item.xDim;
      this.nomaConfig.yDim = item.yDim;
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      // alert(item.name);
  }
/*
  public openGPLOM() {
      $window.open('/gplom.html', '_blank');
  }

  public openLens() {
      $window.open('/lens.html', '_blank');
  }


  public openGPLOMNav() {
      $window.open('/indexmatrixNav.html', '_blank');
  }


  // this.$watch()
  public changeGPLOM() {
      loadGPLOM();
  }*/


  public changeActiveDataCustomCSV(customCSV) {
      this.resetTutMsg();


      this.activeData = 'Cars Data';

      d3.csv(customCSV, (error, tdata: any) => {
          let count = 0;

          tdata.map((d) => {
              d.id = count;
              count += 1;
          });

          this.dataService.setData(tdata);
          this.nomaConfig.dims = d3.keys(tdata[0]);

          let index = this.nomaConfig.dims.indexOf('id');
          this.nomaConfig.dims.splice(index, 1);


          index = this.nomaConfig.dims.indexOf('Name');
          this.nomaConfig.dims.splice(index, 1);


          this.nomaConfig.xDim = null;
          this.nomaConfig.yDim = null;
          this.nomaConfig.colorDim = null;

          this.nomaConfig.isGather = 'gather';
          this.nomaConfig.relativeMode = 'absolute';
          this.configService.setConfig(Object.assign({}, this.nomaConfig));
      });




  }

  public changeActiveDataTitanic() {
      this.resetTutMsg();


      this.activeData = 'Survivors of Titanic';

      let lowMeanHighSDRandomNumberGenerator = d3.randomNormal(30, 5);
      let highMeanLowSDRandomNumberGenerator = d3.randomNormal(50, 10);



      d3.tsv('static/data/Titanic.txt', (error, tdata: any) => {
          let count = 0;

          tdata.map((d) => {
              d.id = count;
              count += 1;

      // if (d.Survived === 'Yes') {

      //     let a = Math.random();

      //     if (d.Class === 'First') {



      //         if (a < 0.202325) {
      //             d.Port = 'Southhampton';
      //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

      //         } else if (a < 0.26496) {
      //             d.Port = 'Queenstown';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


      //         } else if (a < 0.61064) {

      //             d.Port = 'Cherbourg';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      //  highMeanLowSDRandomNumberGenerator();

      //         } else {

      //             d.Port = 'Belfast';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         }
      //     } else if (d.Class === 'Second') {

      //         if (a < 0.202325) {
      //             d.Port = 'Southhampton';
      //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

      //         } else if (a < 0.26496) {
      //             d.Port = 'Queenstown';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


      //         } else if (a < 0.61064) {

      //             d.Port = 'Cherbourg';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         } else {

      //             d.Port = 'Belfast';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         }
      //     } else if (d.Class === 'Third') {

      //         if (a < 0.431254) {
      //             d.Port = 'Southhampton';
      //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

      //         } else if (a < 0.51303) {
      //             d.Port = 'Queenstown';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


      //         } else if (a < 0.74983) {

      //             d.Port = 'Cherbourg';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         } else {

      //             d.Port = 'Belfast';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         }
      //     } else if (d.Class === 'Crew') {

      //         if (a < 0.278968) {
      //             d.Port = 'Southhampton';
      //             d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

      //         } else if (a < 0.50005) {
      //             d.Port = 'Queenstown';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


      //         } else if (a < 0.75641) {

      //             d.Port = 'Cherbourg';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         } else {

      //             d.Port = 'Belfast';
      //             d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //         }
      //     }


      // } else {
      //     if (Math.random() > 0.5) {
      //         d.Port = 'Southhampton';
      //         d.AgeInNumbers = highMeanLowSDRandomNumberGenerator();

      //     } else if (Math.random() > 0.4) {
      //         d.Port = 'Queenstown';
      //         d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator();


      //     } else if (Math.random() > 0.5) {

      //         d.Port = 'Cherbourg';
      //         d.AgeInNumbers = lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator();

      //     } else {

      //         d.Port = 'Belfast';
      //         d.AgeInNumbers =
      // Math.round((lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator()) * 0.7);

      //     }

      // }

      // d.AgeInNumbers = Math.round((lowMeanHighSDRandomNumberGenerator() +
      // highMeanLowSDRandomNumberGenerator()) * 0.7);


          });



          this.dataService.setData(tdata);
          this.nomaConfig.dims = d3.keys(tdata[0]);

          let index = this.nomaConfig.dims.indexOf('id');
          this.nomaConfig.dims.splice(index, 1);

          this.nomaConfig.xDim = this.nomaConfig.dims[0];
          this.nomaConfig.yDim = this.nomaConfig.dims[1];
          this.nomaConfig.colorDim = this.nomaConfig.dims[2];
          this.configService.setConfig(Object.assign({}, this.nomaConfig));

          this.loadGPLOM();

      });


  } // End  this.changeActiveDataTitanic()



  public settingForTitanicLoadAll() {

      this.resetTutMsg();


      if (this.activeData !== 'Survivors of Titanic') {

          this.changeActiveDataTitanic();
      }



      this.nomaConfig.xDim = null;
      this.nomaConfig.yDim = null;
      this.nomaConfig.colorDim = null;

      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';

      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'Here X and Y axes are not defined. Gatherplots make it easy to have an undefined axis.  Check scatterplots and jittering when there is undefined axis.');
      this.focusElement(this.isPlotSelectFocused);

  }

  public settingForTitanicLoadAllSurvived() {

      this.resetTutMsg();


      if (this.activeData !== 'Survivors of Titanic') {

          this.changeActiveDataTitanic();
      }



      this.nomaConfig.xDim = null;
      this.nomaConfig.yDim = null;
      this.nomaConfig.colorDim = 'Survived';

      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));


  }


  public settingForTitanicGenderSurvived() {

      this.resetTutMsg();


      if (this.activeData !== 'Survivors of Titanic') {

          this.changeActiveDataTitanic();
      }



      this.nomaConfig.xDim = 'Sex';
      this.nomaConfig.yDim = null;
      this.nomaConfig.colorDim = 'Survived';

      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'It looks like woman had survived more likely. Is this pattern clear in jittered scatterplots?');
      this.focusElement(this.isPlotSelectFocused);



  }

  public settingForTitanicClassGenderSurvived() {

      this.resetTutMsg();


      if (this.activeData !== 'Survivors of Titanic') {

          this.changeActiveDataTitanic();
      }



      this.nomaConfig.xDim = 'Class';
      this.nomaConfig.yDim = 'Sex';
      this.nomaConfig.colorDim = 'Survived';

      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'The different number of elements in the group makes it difficult to compare the percentage directly. Especially male groups of Second, Third and Crew looks similar.');

  }

  public settingForTitanicClassGenderSurvivedRelative() {

      this.resetTutMsg();


      if (this.activeData !== 'Survivors of Titanic') {

          this.changeActiveDataTitanic();
      }



      this.nomaConfig.xDim = 'Class';
      this.nomaConfig.yDim = 'Sex';
      this.nomaConfig.colorDim = 'Survived';

      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = true;
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info',
        'The size of nodes changes to make the entire group size same '+
        'in order to make comparison between groups easier. ' +
        ' Now we can see that "male Crew" has better survival rate than' +
        ' "male 2nd" or "male 3rd". ' +
        ' Try abolute and relative mode yourself and please leave a feedback ' +
        'about your experience.');
      this.focusElement(this.isRelativeSelectFocused);




  }




  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  // change Active Data to the Bayesian Inference-Mammogram;

  public changeActiveDataMammo() {
      this.resetTutMsg();

      // Config settings
      let numberOfEntity = 3000;
      let numDiscreteVar = 60;

      this.activeData = 'Bayesian Inference - Mammogram';
      let data = [];

      for (let count = 0; count < numberOfEntity; count++) {

          let temp = <any>{};

          temp.id = count;

          // temp.continous_letiable1 = Math.random();
          // temp.continous_letiable2 = Math.random();
          // temp.discrete_letiable = Math.round(Math.random() * (numDiscreteVar - 1));

          // if (Math.random() > 0.3) {
          //     temp.nominal_letiable = 'Male';
          // } else {
          //     temp.nominal_letiable = 'Female';
          // }

          if (Math.random() > 0.99) {
              temp.cancer = 'Cancer';

              if (Math.random() > 0.8) {
                  temp.mammo = 'Negative Mamo';
              } else {
                  temp.mammo = 'Positive Mamo';
              }

           } else {
              temp.cancer = 'No cancer';

              if (Math.random() > 0.096) {
                  temp.mammo = 'Negative Mamo';
              } else {
                  temp.mammo = 'Positive Mamo';
              }
          }

           // temp.descriptor = temp.cancer + ', ' + temp.mamo;

          data.push(temp);
      }

      this.dataService.setData(data);
      this.nomaConfig.dims = Object.keys(data[0]);

      let index = this.nomaConfig.dims.indexOf('id');
      this.nomaConfig.dims.splice(index, 1);

      this.nomaConfig.xDim = null;
      this.nomaConfig.yDim = null;
      this.nomaConfig.colorDim = null;

      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.loadGPLOM();

      // this.$apply();


  } // End  this.changeActiveDataMammo()

  public changeConfigMammoProblem() {

      this.resetTutMsg();



      if (this.activeData !== 'Bayesian Inference - Mammogram') {

          this.changeActiveDataMammo();
      }



      this.nomaConfig.xDim = 'cancer';
      this.nomaConfig.yDim = null;
      this.nomaConfig.colorDim = 'mammo';

      this.nomaConfig.relativeMode = 'absolute';
      this.nomaConfig.isGather = 'gather';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeConfigMammoAnswer() {

      this.resetTutMsg();

      if (this.activeData !== 'Bayesian Inference - Mammogram') {

          this.changeActiveDataMammo();
      }


      this.nomaConfig.xDim = 'mammo';
      this.nomaConfig.yDim = null;
      this.nomaConfig.colorDim = 'cancer';

      this.nomaConfig.relativeMode = 'absolute';
      this.nomaConfig.isGather = 'gather';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeActiveDataContinuous() {
      this.resetTutMsg();

      // Config settings
      let numberOfEntity = 5000;
      let numDiscreteVar = 60;

      this.activeData = 'Continuous Variables';
      let data = [];

      let lowMeanHighSDRandomNumberGenerator = d3.randomNormal(1, 2);
      let highMeanLowSDRandomNumberGenerator = d3.randomNormal(4, 2);

      for (let count = 0; count < numberOfEntity; count++) {

          let temp = <any>{};

          temp.id = count;


          if (Math.random() > 0.7) {
              temp.nominal = 'A';
              temp.continuous1 = highMeanLowSDRandomNumberGenerator();

          } else if (Math.random() > 0.5) {
              temp.nominal = 'B';
              temp.continuous1 = lowMeanHighSDRandomNumberGenerator();


          } else {

              temp.nominal = 'C';
              temp.continuous1 = lowMeanHighSDRandomNumberGenerator() +
                                 highMeanLowSDRandomNumberGenerator();

          }



          temp.continuous2 = (Math.random() * (numDiscreteVar - 1));

          temp.continuous3 = Math.random();

          data.push(temp);
      }

      this.dataService.setData(data);
      this.nomaConfig.dims = d3.keys(data[0]);

      let index = this.nomaConfig.dims.indexOf('id');
      this.nomaConfig.dims.splice(index, 1);

      this.nomaConfig.xDim = 'continuous1';
      this.nomaConfig.yDim = 'continuous2';
      this.nomaConfig.colorDim = 'nominal';
      this.nomaConfig.relativeMode = 'absolute';
      this.nomaConfig.isGather = 'scatter';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.loadGPLOM();

      this.resetTutMsg();

  }

  public settingForContinuousScatter() {

      this.resetTutMsg();

      if (this.activeData !== 'Continuous Variables') {

          this.changeActiveDataContinuous();
      }

     // configService.setRound('absolute');

      this.nomaConfig.xDim = 'continuous1';
      this.nomaConfig.yDim = 'continuous2';
      this.nomaConfig.colorDim = 'nominal';
      this.nomaConfig.relativeMode = 'absolute';
      this.nomaConfig.isGather = 'scatter';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'There is a severe overplotting over the range where X value is near 4.');

  }

  public settingForContinuousGather() {

      this.resetTutMsg();

      if (this.activeData !== 'Continuous Variables') {

          this.changeActiveDataContinuous();
      }

     // configService.setRound('absolute');

      this.nomaConfig.xDim = 'continuous1';
      this.nomaConfig.yDim = 'continuous2';
      this.nomaConfig.colorDim = 'nominal';
      this.nomaConfig.relativeMode = 'absolute';
      this.nomaConfig.isGather = 'gather';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'The trend over the region where overplotting was severe is now clear. However the other regions where there were only small number of nodes were is barely visible. ');

  }

  public updateBinSize(binSize) {

      this.nomaConfig.binSize = binSize;
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      return 'success intuinno';
  }

  public updateBinSizeDefer(binSize) {

      let deferred = new Promise((resolve, reject) => {
        setTimeout(() => {
            // since this fn executes async in a future turn of the event loop, we need to wrap
            // our code into an $apply call so that the model changes are properly observed.
            if (this.updateBinSize(binSize)) {
                resolve('Success!');
            } else {
                reject('Failure');
            }
        }, 1000);
      })
      return deferred;

  }


  public settingForContinuousGatherWithBinSize() {


      this.resetTutMsg();

      if (this.activeData !== 'Continuous Variables') {

          this.changeActiveDataContinuous;
      }

     // configService.setRound('absolute');

      this.nomaConfig.xDim = 'continuous1';
      this.nomaConfig.yDim = 'continuous2';
      this.nomaConfig.colorDim = 'nominal';
      this.nomaConfig.relativeMode = 'absolute';
      this.nomaConfig.isGather = 'gather';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      let promise = this.updateBinSizeDefer(7);

      promise.then((greeting) => {
          console.log('Success: ' + greeting);
      }).catch((reason) => {
          alert('Failed: ' + reason);
      }).then((update) => {
          // alert('Got notification: ' + update);
          this.isAdvancedOptionOpen = true;
          this.addAlert('info', 'You can try different bin size at advanced options menu below.');
          this.focusElement(this.isBinSizeFocused);
      });
      this.isAdvancedOptionOpen = true;

  }

  public settingForContinuousGatherWithBinSizeRelative() {

      this.resetTutMsg();

      if (this.activeData !== 'Continuous Variables') {

          this.changeActiveDataContinuous();
      }

     // configService.setRound('absolute');

      this.nomaConfig.xDim = 'continuous1';
      this.nomaConfig.yDim = 'continuous2';
      this.nomaConfig.colorDim = 'nominal';
      this.nomaConfig.relativeMode = true;
      this.nomaConfig.isGather = 'gather';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));

      this.addAlert('info', 'Here you can see that the distributions of sparse regions are more visible. It makes spotting outliers much easier. Compare absolute and relative mode to feel this change. Can you tell what is the underlying distribution of these random letiables?');
      this.focusElement(this.isRelativeSelectFocused);

  }



  public changeActiveDataCars() {
      this.resetTutMsg();


      this.activeData = 'Cars Data';

      d3.csv('static/data/cars.csv', (error, tdata: any) => {
          let count = 0;

          tdata.map((d) => {
              d.id = count;
              count += 1;
          });

          this.dataService.setData(tdata);
          this.nomaConfig.dims = d3.keys(tdata[0]);

          let index = this.nomaConfig.dims.indexOf('id');
          this.nomaConfig.dims.splice(index, 1);


          index = this.nomaConfig.dims.indexOf('Name');
          this.nomaConfig.dims.splice(index, 1);


          this.nomaConfig.xDim = 'Cylinders';
          this.nomaConfig.yDim = 'MPG';
          this.nomaConfig.colorDim = 'Origin';

          this.nomaConfig.isGather = 'gather';
          this.isCarsOpen = true;
          this.nomaConfig.relativeMode = 'absolute';
          this.configService.setConfig(Object.assign({}, this.nomaConfig));
          this.loadGPLOM();


      });

  }

  public loadGPLOM() {

      this.configMatrix = [];

      for (let xIndex in this.nomaConfig.dims) {
          if(this.nomaConfig.dims.hasOwnProperty(xIndex)) {
              let xTemp = [];

              for (let yIndex in this.nomaConfig.dims) {
                  if(this.nomaConfig.dims.hasOwnProperty(yIndex)) {
                      let temp = <any>{};

                      temp.SVGAspectRatio = 1;
                      temp.colorDim = '';
                      temp.isGather = 'gather';
                      temp.isInteractiveAxis = false;
                      temp.relativeMode = 'absolute';
                      temp.dims = this.nomaConfig.dims;
                      temp.xDim = this.nomaConfig.dims[xIndex];
                      temp.yDim = this.nomaConfig.dims[yIndex];
                      temp.matrixMode = true;
                      xTemp.push(temp);
                  }
              }

             this.configMatrix.push(xTemp);
          }
      }
  }


  public changeConfigCarsScatterplots() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

     // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Horsepower';
      this.nomaConfig.yDim = 'MPG';
      this.nomaConfig.colorDim = 'Origin';
      this.nomaConfig.isGather = 'scatter';
      this.nomaConfig.relativeMode = 'absolute';

      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeConfigCarsScatterOneNominal() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

      // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Cylinders';
      this.nomaConfig.yDim = 'MPG';
      this.nomaConfig.colorDim = null;
      this.nomaConfig.isGather = 'scatter';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeConfigCarsJitterOneNominal() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

      // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Cylinders';
      this.nomaConfig.yDim = 'MPG';
      this.nomaConfig.colorDim = null;
      this.nomaConfig.isGather = 'jitter';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeConfigCarsJitterOneNominalWithColor() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

      // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Cylinders';
      this.nomaConfig.yDim = 'MPG';
      this.nomaConfig.colorDim = 'Origin';
      this.nomaConfig.isGather = 'jitter';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeConfigCarsGatherOneNominalWithColor() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

      // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Cylinders';
      this.nomaConfig.yDim = 'MPG';
      this.nomaConfig.colorDim = 'Origin';
      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
  }

  public changeConfigCarsGatherTwoNominalWithColor() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

      // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Cylinders';
      this.nomaConfig.yDim = 'Origin';
      this.nomaConfig.colorDim = 'Origin';
      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'Here Cylinders and Origin are both nominal letiables. Try what happens with scatterplots or jittering.');
      this.focusElement(this.isPlotSelectFocused);

  }

  public changeConfigCarsGatherTwoNominalWithContinuousColor() {

      this.resetTutMsg();

      if (this.activeData !== 'Cars Data') {

          this.changeActiveDataCars();
      }

      // configService.setRound('absolute');

      this.nomaConfig.xDim = 'Cylinders';
      this.nomaConfig.yDim = 'Origin';
      this.nomaConfig.colorDim = 'Weight';
      this.nomaConfig.isGather = 'gather';
      this.nomaConfig.relativeMode = 'absolute';
      this.configService.setConfig(Object.assign({}, this.nomaConfig));
      this.addAlert('info', 'Here the color of nodes represent a weight, which is continuous. Having ordered arrangement makes it easier to discern minute changes in colors.  Compare with scatterplots or jittering.');
      this.focusElement(this.isPlotSelectFocused);



  }

  public changeActiveDataEHR() {

      this.resetTutMsg();


      this.activeData = 'Electronic Health Records (EHR)';

      d3.csv('static/data/trauma.csv', (error, tdata: any) => {
          let count = 0;

          tdata.map((d) => {
              d.id = count;
              count += 1;
          });

          this.dataService.setData(tdata);
          this.nomaConfig.dims = d3.keys(tdata[0]);

          let index = this.nomaConfig.dims.indexOf('id');
          this.nomaConfig.dims.splice(index, 1);

          this.nomaConfig.xDim = '';
          this.nomaConfig.yDim = '';
          this.nomaConfig.colorDim = '';

          this.nomaConfig.isGather = 'gather';
          this.isCarsOpen = true;
          this.nomaConfig.relativeMode = 'absolute';

          this.configService.setConfig(Object.assign({}, this.nomaConfig));
      });

  }

  public changeActiveDataComments() {

      this.resetTutMsg();


      this.activeData = 'CommentIQ - Comments Data';

      d3.csv('static/data/gatherplotFeatures.csv', (error, tdata: any) => {
          let count = 0;

          tdata.map((d) => {
              d.id = count;
              count += 1;
          });

          this.dataService.setData(tdata);
          this.nomaConfig.dims = d3.keys(tdata[0]);

          let index = this.nomaConfig.dims.indexOf('id');
          this.nomaConfig.dims.splice(index, 1);

          this.nomaConfig.xDim = '';
          this.nomaConfig.yDim = '';
          this.nomaConfig.colorDim = '';

          this.nomaConfig.isGather = 'gather';
          this.isCarsOpen = true;
          this.nomaConfig.relativeMode = 'absolute';

          this.configService.setConfig(Object.assign({}, this.nomaConfig));
      });

  }

  public changeActiveDataArticles() {

      this.resetTutMsg();


      this.activeData = 'CommentIQ - Articles Data';

      d3.csv('static/data/articlesForGatherplot.csv', (error, tdata: any) => {
          let count = 0;

          tdata.map((d) => {
              d.id = count;
              count += 1;
          });

          this.dataService.setData(tdata);
          this.nomaConfig.dims = d3.keys(tdata[0]);

          let index = this.nomaConfig.dims.indexOf('id');
          this.nomaConfig.dims.splice(index, 1);

          this.nomaConfig.xDim = '';
          this.nomaConfig.yDim = '';
          this.nomaConfig.colorDim = '';

          this.nomaConfig.isGather = 'gather';
          this.isCarsOpen = true;
          this.nomaConfig.relativeMode = 'absolute';
          this.configService.setConfig(Object.assign({}, this.nomaConfig));

      });

  }

}
