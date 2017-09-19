/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/MVC/controllers/ControllerCart.js
 *
 */

export default class ControllerCart {

  constructor(main) {
    this.main = main;
    this.setUI ();
  }

  setUI (){
    jQuery('#select-shipping').change((event)=>{
      this.main.m.changeCountry(jQuery(event.target).val());
    });

    jQuery('.qty').change((event)=>{
      this.main.m.getChangeQty(event.target.id, jQuery(event.target).val());
      this.main.v.cart.hideQtySelect(jQuery(event.target).parent());
    });

    jQuery('#cart-proceed').click(()=>{
      this.validate();
    });

    jQuery('#cart-proceed').keypress((event)=>{
      if (event.keyCode === 13) {
        this.validate();
      }
    });
  }

  validate(){
    let isValid = true;
    if (isValid){
      this.main.v.showCartLoading ();
      window.location = '/checkout/onepage/';
    }
  }

}
