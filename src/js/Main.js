/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/Main.js
 * Main JavaScript entry
 */



// Start with MVC
import Model from './MVC/Model';
import View from './MVC/View';
import Controller from './MVC/Controller';

import packageJSON from '../package.json';
import shake from './utils/jquery-ui';
import creditCard from './utils/jquery.creditCardValidator';

// Which version? Change this up in /package.json & README.md
console.log (`${packageJSON.description} ${packageJSON.version}\n`);

export default class Main {

  constructor() {
    // Instantiate MVC Classes. See https://tinyurl.com/yaqgy73w
    this.m = new Model(this);
    this.v = new View(this);
    this.c = new Controller(this);

    // Create an array of instantiated classes and Set Dependents
    const dependents = [this.m, this.v, this.c];
    this.m.setDependents(dependents);
    this.v.setDependents(dependents);
    this.c.setDependents(dependents);
  }
}

jQuery( document ).ready(function() {
  const maxTries = 25;
  let thisTry = 0;
  let checkFormkey = setInterval(function (){
    thisTry ++;
    if (thisTry === maxTries){
      clearInterval(checkFormkey);
    }
    let formkey = jQuery('.formkey input').val();
    if (formkey !== '_form_key_placeholder_'){
      CartCheckItOut.formkey = formkey;
      let main = new Main();
      if (CartCheckItOut.mode === 'cart'){
        main.v.cart.show();
      } else if (CartCheckItOut.mode === 'checkout') {
        main.v.checkout.show();
      }
      clearInterval(checkFormkey);
    }
  }, 250);
});

