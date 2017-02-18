/**
 * Created by Yangwook Ryoo on 2017.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[focusMe]'
})

export class FocusmeDirective {
    constructor(private el: ElementRef) {
        // to address @blesh's comment, set attribute value to 'false'
        // on blur event:
        /*    el.bind('blur', function() {
                console.log('blur');
                scope.$apply(model.assign(scope, false));
            });*/
    }
}
  /*
  var model = $parse(attrs.focusMe);
  scope.$watch(model, function(value) {
      console.log('value=', value);
      if (value === true) {
          $timeout(function() {
              element[0].focus();
          });
      }*/
