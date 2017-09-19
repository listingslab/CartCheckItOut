<?php

class Aligent_CartCheckItOut_Helper_Coupongiftcard extends Aligent_CartCheckItOut_Helper_Base
{

    /**
     * Add and remove a coupon from the quote.
     */
    public function applyCouponCode($couponCode) {
        $oldCouponCode = $this->_getQuote()->getCouponCode();

        if (!strlen($couponCode) && (!strlen($oldCouponCode) || $oldCouponCode === null)) {
            Mage::throwException($this->__("Cannot remove empty coupon code."));
        } else {
            try {
                $codeLength = strlen($couponCode);
                $isCodeLengthValid = $codeLength && $codeLength <= Mage_Checkout_Helper_Cart::COUPON_CODE_MAX_LENGTH;

                $this->_getQuote()->getShippingAddress()->setCollectShippingRates(true);

                try {
                    $this->_getQuote()->setCouponCode($isCodeLengthValid ? $couponCode : '')
                        ->collectTotals()
                        ->save();
                } catch (Exception $e) {
                    $this->_getQuote()->setCouponCode('');
                    throw $e;
                }

                if ($codeLength) {
                    if ($isCodeLengthValid && $couponCode == $this->_getQuote()->getCouponCode()) {
                        // Successfully added coupon

                        $this->updatePaymentMethod();
                        return true;
                    } else {
                        Mage::throwException($this->__('Your promo code is not valid', Mage::helper('core')->escapeHtml($couponCode)));
                    }
                } else {
                    // Removed coupon

                    $this->updatePaymentMethod();
                    return true;
                }

            } catch (Mage_Core_Exception $e) {
                Mage::logException($e);
                Mage::throwException($e->getMessage());
            } catch (Exception $e) {
                Mage::logException($e);
                Mage::throwException($this->__('Cannot apply the coupon code.....'));
            }
        }
        return true;
    }


    /**
     * Apply the given gift card to the quote
     *
     * @param $vGiftCardCode
     * @return bool
     */
    public function applyGiftCard($vGiftCardCode) {
        if ($vGiftCardCode) {
            $oGiftCard = Mage::getModel('enterprise_giftcardaccount/giftcardaccount')
                ->loadByCode($vGiftCardCode);

            if ($oGiftCard->getId()) {
                try {
                    $oGiftCard->addToCart();
                    $this->updatePaymentMethod();
                } catch (Exception $e) {
                    Mage::logException($e);
                    Mage::throwException($this->__("Gift card could not be applied to your order."));
                }
            } else {
                Mage::throwException($this->__('Your Gift Card is not valid'));
            }
        } else {
            Mage::throwException($this->__("A Gift card code was not entered."));
        }
        return true;
    }

    /**
     * Remove the given gift card from quote.
     *
     * @param $vGiftCardCode
     * @return bool
     */
    public function removeGiftCard($vGiftCardCode)
    {
        if ($vGiftCardCode) {
            try {
                $oGiftCard = Mage::getModel('enterprise_giftcardaccount/giftcardaccount')
                    ->loadByCode($vGiftCardCode)
                    ->removeFromCart();
                $this->updatePaymentMethod();
            } catch (Mage_Core_Exception $e) {
                Mage::throwException($e->getMessage());
            } catch (Exception $e) {
                Mage::throwException($this->__("Cannot remove gift card."));
            }
        }
        return true;
    }

    /**
     * If applying a coupon or GC causes the subtotal to be free, update the payment method.
     */
    protected function updatePaymentMethod() {
        // Force total collection so that payment method step renders including
        // Zero Subtotal Checkout if the giftcard covers the full amount..
        $this->_getQuote()->collectTotals()->save();

        if ($this->_getQuote()->getGrandTotal() < 0.01) {
            Mage::helper('aligent_cartcheckitout/quote')->setPaymentMethod('free');
        } else {
            // if the payment method is free then swap to default.
            $currentMethod = Mage::helper('aligent_cartcheckitout/quote')->checkQuoteForPaymentMethod();

            if ($currentMethod == 'free') {
                $methods = Mage::helper('aligent_cartcheckitout/quote')->getPaymentMethods();
                if (count($methods) !== 0) {
                    Mage::helper('aligent_cartcheckitout/quote')->setPaymentMethod($methods[0]->getCode());
                }
            }
        }
    }
}
