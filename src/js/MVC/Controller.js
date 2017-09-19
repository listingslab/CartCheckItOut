/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/Controller.js
 * Handles anything to do with user interaction
 *
 */

import ControllerCart from './controllers/ControllerCart';
import ControllerEmail from './controllers/ControllerEmail';
import ControllerPassword from './controllers/ControllerPassword';
import ControllerDeliveryPayment from './controllers/ControllerDeliveryPayment';
import ControllerValidation from './controllers/ControllerValidation';
import ControllerPreviousCart from './controllers/ControllerPreviousCart';

export default class Controller {

  constructor(main) {
    this.main = main;
    this.shortName = 'c';
    this.initControllers();
  }

  initControllers (){
    let controllerMode;
    if (CartCheckItOut.mode === 'cart'){
      controllerMode = 'cart';

      $( document ).on("guestwishlist:additem",function(e){
        var productId = e.memo.productId;
        var orderItem = jQuery('#product-'+productId);
        var item = orderItem.data('item-id');

        orderItem.hide();

        this.main.m.removeItem(item);

      }.bind(this));

    } else if (CartCheckItOut.mode === 'checkout') {
      if (!CartCheckItOut.loggedIn){
        controllerMode = 'notLoggedIn';
      } else {
        controllerMode = 'loggedIn';
      }
    }
    this.validation = new ControllerValidation (this.main);
    switch(controllerMode) {
      case 'cart':
        this.cart = new ControllerCart (this.main);
        break;
      case 'notLoggedIn':
        this.email = new ControllerEmail (this.main);
        this.password = new ControllerPassword(this.main);
        this.previouscart = new ControllerPreviousCart(this.main);
        this.deliverypayment = new ControllerDeliveryPayment (this.main);
        break;
      case 'loggedIn':
        this.deliverypayment = new ControllerDeliveryPayment (this.main);
        break;
      default:
    }
  }

  setDependents(dependents) {
    // Set Dependent MVC Classes
    // See https://tinyurl.com/yaqgy73w
    for (let i=0; i<dependents.length; i++){
      this[dependents[i].shortName] = dependents[i];
    }
  }

  setTotalDelete () {
    jQuery('.remove-discount').click(() => {
      this.main.v.showTotalsLoading ();
      this.main.m.getRemovepromocode ();
      return false;
    });

    jQuery('.remove-giftcard').click((event) => {
      this.main.v.showTotalsLoading ();
      this.main.m.getRemovegiftcard (event.target.id);
      return false;
    });

  }

  applyPromo () {
    const promocode = jQuery('#promocode').val();
    const promocodeField = jQuery('#promocode');
    if (promocode === ''){
      this.main.v.fieldShowError (promocodeField, false);
    }else{
      this.main.m.getApplyPromo(promocode);
      this.main.v.cart.showPromocodeLoading();
    }
  }

  applyGift () {
    const giftcard = jQuery('#giftcard').val();
    const giftcardField = jQuery('#giftcard');
    if (giftcard === ''){
      this.main.v.fieldShowError (giftcardField, false);
    }else{
      this.main.m.getApplyGiftcard(giftcard);
      this.main.v.cart.showGiftcardLoading();
    }
  }

  setPromoGiftUI () {
    jQuery('#apply-promo').click(()=>{
      this.applyPromo ();
    });

    jQuery('#promocode').keyup((event)=>{
      if (event.keyCode === 13) {
        this.applyPromo ();
      }
    });

    jQuery('#apply-gift').click(()=>{
      this.applyGift ();
    });

    jQuery('#giftcard').keyup((event)=>{
      if (event.keyCode === 13) {
        this.applyGift ();
      }
    });

  }

}
