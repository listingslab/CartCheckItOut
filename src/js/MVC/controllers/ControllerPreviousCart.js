export default class ControllerPreviousCart {

  constructor(main) {
    this.main = main;
    this.content = '';
  }

  setUI (count, content){
    var item = 'Item';
    if (count > 1) {
      item += 's';
    }

    this.content = content;

    jQuery('#previouscart-content').html(content);
    jQuery('#previouscart-count').html(count +' '+item);

    jQuery('#previouscart-merge').click(() => {
      this.main.v.showPreviousCartLoading();
      this.main.v.showPreviousCartLoading();

      this.main.m.getLoginConfirmed (CartCheckItOut.email, jQuery('#input-password').val(), 1);
      return false;
    });

    jQuery('#previouscart-cart').click(() => {
      this.main.v.showPreviousCartLoading();
      this.main.v.showPreviousCartLoading();

      this.main.m.getLoginRedirect (CartCheckItOut.email, jQuery('#input-password').val());
      return false;
    });

    jQuery('#previouscart-abandon').click(() => {
      this.main.v.showPreviousCartLoading();
      this.main.v.showPreviousCartLoading();

      this.main.m.getLoginConfirmed (CartCheckItOut.email, jQuery('#input-password').val(), 0);
      return false;
    });
  }

  transferCartToSummary() {
    var summaryCount = jQuery('#summary-content');
    summaryCount.append(this.content);

    jQuery('#summary-num-items').html(summaryCount.children().length +' Items');
  }
}