/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/MVC/controllers/ControllerDeliveryPayment.js
 *
 */

export default class ControllerDeliveryPayment {

  constructor(main) {
    this.main = main;
  }

  setUI (){
    jQuery(window).unbind('keypress');

    this.setStateInput(jQuery('#select-shipping').val(), 'delivery');
    this.setStateInput(jQuery('#select-billing').val(), 'billing');

    this.setDeliveryGoogleAutoComplete ();
    this.setBillingGoogleAutoComplete ();
    if (CartCheckItOut.customer !== undefined){
      if (CartCheckItOut.customer.shipping === undefined){
        CartCheckItOut.customer.shipping = CartCheckItOut.customer.deliveryAddress;
      }
      if (CartCheckItOut.customer.shipping.firstname === ' '){
        jQuery('#input-firstname').val('');
      }else{
        jQuery('#input-firstname').val(CartCheckItOut.customer.shipping.firstname);
      }
      this.main.c.validation.validateField('deliveryFirstname');
      if (CartCheckItOut.customer.shipping.lastname === ' ') {
        jQuery('#input-lastname').val('');
      }else{
        jQuery('#input-lastname').val(CartCheckItOut.customer.shipping.lastname);
      }
      this.main.c.validation.validateField('deliveryLastname');
      if (CartCheckItOut.customer.shipping.Street !== undefined){
        jQuery('#delivery-street-address').val(CartCheckItOut.customer.shipping.Street[0]);
      }
      this.main.c.validation.validateField('deliveryStreet');
      jQuery('#delivery-city').val(CartCheckItOut.customer.shipping.city);
      this.main.c.validation.validateField('deliveryCity');
      if (CartCheckItOut.deliveryStates === 'select'){
        jQuery('#delivery-state-select option').filter(function() {
          return jQuery(this).text() == CartCheckItOut.customer.shipping.region;
        }).prop('selected', true);
      } else {
        jQuery('#delivery-state-text').val(CartCheckItOut.customer.shipping.region);
      }
      jQuery('#delivery-postcode').val(CartCheckItOut.customer.shipping.zip);
      this.main.c.validation.validateField('deliveryPostcode');
      jQuery('#business-name').val(CartCheckItOut.customer.shipping.company);
      jQuery('#delivery-telephone').val(CartCheckItOut.customer.shipping.telephone);
      this.main.c.validation.validateField('deliveryPhone');
      this.makeDeliveryAddress ();

      if (CartCheckItOut.customer.billing === undefined){
        CartCheckItOut.customer.billing = CartCheckItOut.customer.billingAddress;
      }
      if (CartCheckItOut.customer.billing.length !== 0){
        jQuery('#input-billing-firstname').val(CartCheckItOut.customer.billing.firstname);
        jQuery('#input-billing-lastname').val(CartCheckItOut.customer.billing.lastname);
        if (CartCheckItOut.customer.billing.Street !== undefined){
          jQuery('#billing-street-address-ip').val(CartCheckItOut.customer.billing.Street[0]);
        }
        jQuery('#billing-city').val(CartCheckItOut.customer.billing.city);
        if (CartCheckItOut.billingStates === 'select'){
          jQuery('#billing-state-select option').filter(function() {
            return jQuery(this).text() == CartCheckItOut.customer.billing.region;
          }).prop('selected', true);
        } else {
          jQuery('#billing-state-text').val(CartCheckItOut.customer.billing.region);
        }
        jQuery('#billing-state').val(CartCheckItOut.customer.billing.state);
        jQuery('#billing-postcode').val(CartCheckItOut.customer.billing.zip);
        jQuery('#billing-telephone').val(CartCheckItOut.customer.billing.telephone);
        this.makeBillingAddress ();
      }
    }

    jQuery('#update-quote').click((event) => {
      this.main.m.getUpdatequote();
    });

    jQuery('#select-shipping').change((event)=>{
      CartCheckItOut.deliveryCountry = jQuery(event.target).val();
      this.resetDeliveryAddress ();
      this.setDeliveryGoogleAutoComplete ();
      this.setStateInput(jQuery(event.target).val(), 'delivery');

      // If billing is the same, change the country.
      if (!CartCheckItOut.billingAddress) {
        jQuery('#select-billing').val(jQuery(event.target).val());
      }

      this.main.m.changeCountry(CartCheckItOut.deliveryCountry);
    });

    jQuery('#select-billing').change((event)=>{
      CartCheckItOut.billingCountry = jQuery(event.target).val();
      this.resetBillingAddress ();
      this.setBillingGoogleAutoComplete ();
      this.setStateInput(jQuery(event.target).val(), 'billing');

      this.main.m.changeBillingCountry(CartCheckItOut.billingCountry);
    });

    jQuery('#billing-address-checkbox').change((event) => {
      this.main.v.checkout.toggleBillingAddress();
      return false;
    });

    jQuery('#authority-to-leave').change((event) => {
      this.main.v.checkout.toggleAuthorityToLeave();
      return false;
    });

    jQuery('#newsletter-checkbox').change((event) => {
      this.main.v.checkout.toggleNewsletter();
      return false;
    });

    jQuery('#address-not-found').click((event) => {
      this.main.v.checkout.toggleManualAddress();
      return false;
    });


    jQuery('#billing-address-not-found').click((event) => {
      this.main.v.checkout.toggleManualBillingAddress();
      return false;
    });

    this.setupPaymentUI('.payment-option');

    jQuery('#checkout-proceed').click(() => {
      this.main.c.validation.validate();
    });

    jQuery(window).keyup((event) => {
      if (event.which === 13) {
        this.main.c.validation.validate();
        event.preventDefault();
      }
    });

    jQuery('#input-firstname').blur((event) => {
        this.main.v.checkout.updateAccountName(
            jQuery('#input-firstname').val(),
            jQuery('#input-lastname').val()
        );
    });
    jQuery('#input-lastname').blur((event) => {
        this.main.v.checkout.updateAccountName(
            jQuery('#input-firstname').val(),
            jQuery('#input-lastname').val()
        );
    });

    jQuery('#input-firstname').keyup((event) => {
      this.main.c.validation.validateField('deliveryFirstname');
    });
    jQuery('#input-lastname').keyup((event) => {
      this.main.c.validation.validateField('deliveryLastname');
    });
    jQuery('#delivery-telephone').keyup((event) => {
      this.main.c.validation.validateField('deliveryPhone');
    });
    jQuery('#delivery-street-address').keyup((event) => {
      this.main.c.validation.validateField('deliveryStreet');
      this.makeDeliveryAddress ();
    });
    jQuery('#delivery-city').keyup((event) => {
      this.main.c.validation.validateField('deliveryCity');
      this.makeDeliveryAddress ();
    });
    jQuery('#delivery-postcode').keyup((event) => {
      this.main.c.validation.validateField('deliveryPostcode');
      this.makeDeliveryAddress ();
    });

    jQuery('#input-billing-firstname').keyup((event) => {
      this.main.c.validation.validateBillingField('billingFirstname');
    });
    jQuery('#input-billing-lastname').keyup((event) => {
      this.main.c.validation.validateBillingField('billingLastname');
    });
    jQuery('#billing-street-address-ip').keyup((event) => {
      this.main.c.validation.validateBillingField('billingStreet');
      this.makeBillingAddress ();
    });
    jQuery('#billing-city').keyup((event) => {
      this.main.c.validation.validateBillingField('billingCity');
      this.makeBillingAddress ();
    });
    jQuery('#billing-postcode').keyup((event) => {
      this.main.c.validation.validateBillingField('billingPostcode');
      this.makeBillingAddress ();
    });
    jQuery('#billing-telephone').keyup((event) => {
      this.main.c.validation.validateBillingField('billingPhone');
    });

    this.setupCCClickers();
  }

  setupCCClickers() {
    jQuery('.cvv-image').hide();
    CartCheckItOut.cvv = false;

    jQuery('.question-mark').click((event) => {
      this.main.v.checkout.toggleCVV();
      return false;
    });

    jQuery('#aligent_directpost_securepay_cc_number').keyup((event) => {
      this.main.c.validation.validateCreditCardField('cc_number');
    });

    jQuery('#aligent_directpost_securepay_cc_cid').keyup((event) => {
      this.main.c.validation.validateCreditCardField('cc_cvv');
    });

    jQuery('#aligent_directpost_securepay_expiration').change((event)=>{
      this.main.c.validation.validateExp('cc_exp_month');
    });

    jQuery('#aligent_directpost_securepay_expiration_yr').change((event)=>{
      this.main.c.validation.validateExp('cc_exp_year');
    });

  }

  setupPaymentUI(selector) {
    jQuery(selector).hover(
      function(event) {
        if (event.target.id !== CartCheckItOut.paymentOption){
          event.target.src = `${CartCheckItOut.imagePath}payment/${event.target.id}_over.png`;
        }
      },
      function(event) {
        if (event.target.id !== CartCheckItOut.paymentOption) {
          event.target.src = `${CartCheckItOut.imagePath}payment/${event.target.id}.png`;
        }
      }
    );

    jQuery(selector).click((event) => {
      if (event.target.id !== CartCheckItOut.paymentOption) {
      this.main.m.setPaymentOption(event.target.id);
    }
  });
  }

  regionsRequired (countryCode){
    for (let i=0; i<CartCheckItOut.regionJson.config.regions_required.length; i++){
      if (CartCheckItOut.regionJson.config.regions_required[i] === countryCode){
        return CartCheckItOut.regionJson[countryCode];
      }
    }
    return false;
  }

  setStateInput (countryCode, address) {
    const regionCodes = this.regionsRequired(countryCode);
    if (!regionCodes){
      if (address === 'delivery'){
        jQuery('#delivery-state-select').hide();
        jQuery('#delivery-state-text').show();
        CartCheckItOut.deliveryStates = 'text';
      } else if (address === 'billing'){
        jQuery('#billing-state-select').hide();
        jQuery('#billing-state-text').show();
        CartCheckItOut.billingStates = 'text';
      }
    }else{
      let stateSelector;
      if (address === 'delivery'){
        jQuery('#delivery-state-text').hide();
        jQuery('#delivery-state-select').show();
        CartCheckItOut.deliveryStates = 'select';
        stateSelector = jQuery('#delivery-state-select');
      } else if (address === 'billing'){
        jQuery('#billing-state-text').hide();
        jQuery('#billing-state-select').show();
        CartCheckItOut.billingStates = 'select';
        stateSelector = jQuery('#billing-state-select');
      }
      stateSelector.empty();
      let option = jQuery("<option></option>")
        .attr('value', 0)
        .text('Select State');
      stateSelector.append(option);
      jQuery.each (regionCodes, function (code){
        let option = jQuery("<option></option>")
          .attr('value', code)
          .text($(this).name);
        stateSelector.append(option);
      });
    }
  }

  setDeliveryGoogleAutoComplete (){
    const placeSelectorOptions = {
      types: ['geocode'],
      main: this.main,
      callback:this.googleDeliveryPlaceChange,
      componentRestrictions: {
        country: CartCheckItOut.deliveryCountry
      }
    };
    this.deliveryField = new google.maps.places.Autocomplete(
      (document.getElementById('delivery-address')), placeSelectorOptions);
    this.deliveryField.addListener('place_changed', function (){
      this.callback(this.getPlace());
    });
  }

  setBillingGoogleAutoComplete (){
    const placeSelectorOptions = {
      types: ['geocode'],
      main: this.main,
      callback:this.googleBillingPlaceChange,
      componentRestrictions: {
        country: CartCheckItOut.billingCountry
      }
    };
    this.deliveryField = new google.maps.places.Autocomplete(
      (document.getElementById('billing-address')), placeSelectorOptions);
    this.deliveryField.addListener('place_changed', function (){
      this.callback(this.getPlace());
    });
  }

  makeDeliveryAddress (){
    let streetAddress = jQuery('#delivery-street-address').val();
    if (streetAddress !== ''){
      streetAddress += ', ';
    }
    let city = jQuery('#delivery-city').val();
    if (city !== ''){
      city += ', ';
    }
    let region = '';
    if (CartCheckItOut.deliveryStates === 'select'){
      let region_id = jQuery('#delivery-state-select').val();
      if (region_id !== '0'){
        region = jQuery('#delivery-state-select option:selected').text();
      }
    } else {
      region = jQuery('#delivery-state-text').val();
    }
    if (region !== '' && region !== undefined ){
      region += ', ';
    }
    let postcode = jQuery('#delivery-postcode').val();
    let deliveryAddress = `${streetAddress}${city}${region}${postcode}`;
    const maxLength = 40;
    if (deliveryAddress.length > maxLength){
      deliveryAddress = `${deliveryAddress.substring(0, maxLength)}...`;
    }
    jQuery('#delivery-address').val(deliveryAddress);
    this.main.c.validation.validateField('deliveryAddress');
  }

  makeBillingAddress (){
    let streetAddress = jQuery('#billing-street-address-ip').val();
    if (streetAddress !== ''){
      streetAddress += ', ';
    }
    let city = jQuery('#billing-city').val();
    if (city !== ''){
      city += ', ';
    }
    let region = '';
    if (CartCheckItOut.billingStates === 'select'){
      let region_id = jQuery('#billing-state-select').val();
      if (region_id !== '0'){
        region = jQuery('#billing-state-select option:selected').text();
      }
    } else {
      region = jQuery('#billing-state-text').val();
    }
    if (region !== '' && region !== undefined ){
      region += ', ';
    }
    let postcode = jQuery('#billing-postcode').val();
    let billingAddress = `${streetAddress}${city}${region}${postcode}`;
    const maxLength = 40;
    if (billingAddress.length > maxLength){
      billingAddress = `${billingAddress.substring(0, maxLength)}...`;
    }
    jQuery('#billing-address').val(billingAddress);
    this.main.c.validation.validateBillingField('billingAddress');
  }

  getStreetComponents(place, country) {
    var components = {};
    var returnAddressComponents = {};

    jQuery.each(
      place.address_components,
      function(k,v1) {
        jQuery.each(
          v1.types,
          function(k2, v2){
            components[v2]={};
            components[v2]['short'] = v1.short_name;
            components[v2]['long'] = v1.long_name;
          }
        );
      }
    );

    var sub_premise = '';
    if (components['subpremise'] !== undefined) {
      sub_premise = components['subpremise']['long'];
    }

    var street_number = '';
    if (components['street_number'] !== undefined) {
      street_number = components['street_number']['long'];
    }

    var street_route = '';
    if (components['route'] !== undefined) {
      street_route = components['route']['short'];
    }

    var street_sublocality = '';
    if (components['sublocality'] !== undefined) {
      street_sublocality = components['sublocality']['long'];
    }

    returnAddressComponents['streetAddress'] = street_number +' '+ street_route;

    if (sub_premise !== '') {
      returnAddressComponents['streetAddress'] = sub_premise +'/'+ returnAddressComponents['streetAddress'];
    }

    var street_city = '';
    var street_region = '';

    if (country === 'NZ') {
      // locality is the state.
      // sublocality is the city
      if (components['locality'] !== undefined) {
        street_region = components['locality']['long'];
      }
      street_city = street_sublocality;
    } else {
      // Locality is the city
      // Admin area is the state
      if (components['locality'] !== undefined) {
        street_city = components['locality']['long'];
      }

      if (components['administrative_area_level_1'] !== undefined) {
        street_region = components['administrative_area_level_1']['long'];
      }
    }

    returnAddressComponents['city'] = street_city;
    returnAddressComponents['region'] = street_region;


    var street_postcode = '';
    if (components['postal_code'] !== undefined) {
      street_postcode = components['postal_code']['short'];
    }

    returnAddressComponents['postcode'] = street_postcode;

    return returnAddressComponents;
  }

  googleDeliveryPlaceChange (place) {
    let address = this.main.c.deliverypayment.getStreetComponents(place, CartCheckItOut.deliveryCountry);

    let streetAddress = address['streetAddress'];
    jQuery('#delivery-street-address').val(streetAddress);

    const city = address['city'];
    jQuery('#delivery-city').val(city);

    let region = address['region'];

    if (CartCheckItOut.deliveryStates === 'select'){
      // ACT can return Australian or Australia
      if (region.slice(0, 9) == 'Australia') {
        jQuery('#delivery-state-select option').filter(function() {
          return jQuery(this).text().slice(0, 9) == 'Australia';
        }).prop('selected', true);
      } else {
        jQuery('#delivery-state-select option').filter(function() {
          return jQuery(this).text() == region;
        }).prop('selected', true);
      }
    } else {
      jQuery('#delivery-state-text').val(region);
    }

    const postcode = address['postcode'];
    jQuery('#delivery-postcode').val(postcode);

    this.main.c.deliverypayment.makeDeliveryAddress ();
    this.main.c.validation.validateField('deliveryStreet');
    this.main.c.validation.validateField('deliveryCity');
    this.main.c.validation.validateField('deliveryPostcode');
  }

  googleBillingPlaceChange (place) {
    let address = this.main.c.deliverypayment.getStreetComponents(place, CartCheckItOut.billingCountry);

    let streetAddress = address['streetAddress'];
    jQuery('#billing-street-address-ip').val(streetAddress);

    const city = address['city'];
    jQuery('#billing-city').val(city);

    let region = address['region'];

    if (CartCheckItOut.billingStates === 'select'){
      // ACT can return Australian or Australia
      if (region.slice(0, 9) == 'Australia') {
        jQuery('#billing-state-select option').filter(function() {
          return jQuery(this).text().slice(0, 9) == 'Australia';
        }).prop('selected', true);
      } else {
        jQuery('#billing-state-select option').filter(function() {
          return jQuery(this).text() == region;
        }).prop('selected', true);
      }
    } else {
      jQuery('#billing-state-text').val(region);
    }

    const postcode = address['postcode'];
    jQuery('#billing-postcode').val(postcode);

    this.main.c.deliverypayment.makeBillingAddress ();
    this.main.c.validation.validateBillingField('billingStreet');
    this.main.c.validation.validateBillingField('billingCity');
    this.main.c.validation.validateBillingField('billingPostcode');
  }

  resetDeliveryAddress () {
    jQuery('#delivery-address').val('');
    jQuery('#delivery-street-address').val('');
    this.main.v.fieldReset (jQuery('#delivery-street-address'));
    jQuery('#delivery-city').val('');
    this.main.v.fieldReset (jQuery('#delivery-city'));
    jQuery('#delivery-state-text').val('');
    this.main.v.fieldReset (jQuery('#delivery-state-text'));
    jQuery('#delivery-postcode').val('');
    this.main.v.fieldReset (jQuery('#delivery-postcode'));
    this.main.c.deliverypayment.makeDeliveryAddress ();
  }

  resetBillingAddress () {
    jQuery('#billing-address').val('');
    jQuery('#billing-street-address-ip').val('');
    this.main.v.fieldReset (jQuery('#billing-street-address'));
    jQuery('#billing-city').val('');
    this.main.v.fieldReset (jQuery('#billing-city'));
    jQuery('#billing-state').val('');
    this.main.v.fieldReset (jQuery('#billing-state'));
    jQuery('#billing-postcode').val('');
    this.main.v.fieldReset (jQuery('#billing-postcode'));
    this.main.c.deliverypayment.makeBillingAddress ();
  }

}
