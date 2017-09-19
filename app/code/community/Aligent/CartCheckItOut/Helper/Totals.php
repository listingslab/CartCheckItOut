<?php
/**
 * Aligent_CartCheckItOut
 *
 * @category   Aligent
 * @package    cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Michael Wylde <michael@aligent.com.au>
 *
 * app/code/community/Aligent/CheckItOut/Helper/Totals.php
 * Get Quote Totals for cart & checkout
 *
 */

class Aligent_CartCheckItOut_Helper_Totals extends Aligent_CartCheckItOut_Helper_Base
{
    protected $_defaultRenderer = 'checkout/total_default';
    protected $_dollarsToFreeShip = null;

    /**
     * Get the totals from the cached quote object.
     *
     * @return mixed
     */
    protected function _getTotals() {
        return $this->_getQuote()->getTotals();
    }

    /**
     * Get all totals in correct order and formatting for quote.
     * Logic is taken from the various templates to make them as similar to the source.
     *
     * @return array
     */
    public function getQuoteTotals() {
        $return = [];

        foreach ($this->_getTotals() as $_total) {
            $code = $_total->getCode();
            if ($_total->getAs()) {
                $code = $_total->getAs();
            }

            $block = $this->_getTotalBlockRenderer($code)
                ->setTotal($_total);

            switch($code) {
                case 'giftcardaccount':
                    //Logic taken from template
                    $_cards = $block->getTotal()->getGiftCards();
                    if (!$_cards) {
                        $_cards = $block->getQuoteGiftCards();
                    }
                    if ($_total->getValue()) {
                        foreach ($_cards as $index => $_c) {
                            $removeUrl = Mage::getUrl('enterprise_giftcardaccount/cart/remove', array('code' => $_c['c']));
                            $return[] = $this->_prepareTotal($_total->getCode(), $block->__('Gift Card (%s)', $_c['c']), $_c['a'], ['remove' => $removeUrl, 'gid'=>$_c['c']]);
                        }
                    }
                    break;
                case 'giftwrapping':
                    //Logic taken from template
                    if ($_total->getValue() !== null) {
                        $return[] = $this->_prepareTotal($_total->getCode(), $_total->getTitle(), $_total->getValue());
                    }
                    break;
                case 'subtotal':
                    //Logic taken from template
                    if ($block->displayBoth()) {
                        $return[] = $this->_prepareTotal($_total->getCode(), $block->__('Subtotal (Excl. Tax)'), $_total->getValueExclTax());
                        $return[] = $this->_prepareTotal($_total->getCode(), $block->__('Subtotal (Incl. Tax)'), $_total->getValueInclTax());
                    } else {
                        $return[] = $this->_prepareTotal($_total->getCode(), $_total->getTitle(), $_total->getValue());
                    }
                    break;
                case 'grand_total':
                    //Logic taken from template
                    if ($block->includeTax() && $block->getTotalExclTax() >= 0) {
                        $return[] = $this->_prepareTotal($_total->getCode(), $block->__('Grand Total Excl. Tax'), $block->getTotalExclTax());
                        $return[] = $this->_prepareTotal($_total->getCode(), $block->__('Grand Total Incl. Tax'), $_total->getValue());
                    } else {
                        $return[] = $this->_prepareTotal($_total->getCode(), $_total->getTitle(), $_total->getValue());
                    }
                    break;
                case 'discount':
                    $return[] = $this->_prepareTotal($_total->getCode(), $block->__('Discount(s)'), $_total->getValue());
                    break;
                default:
                    $return[] = $this->_prepareTotal($_total->getCode(), $_total->getTitle(), $_total->getValue());
                    break;

            }
        }
        return $return;
    }

    public function isFreeShippingPossible() {
        return Mage::helper('aligent_cartcheckitout/customer')->getShippingCountry() == 'AU';
    }

    public function hasFreeShipping() {
        if (($this->isFreeShippingPossible() && $this->getDollarsToFreeShip() <= 0) || Mage::helper('swimwear_checkout')->quoteHasFreeShipping()) {
            return true;
        }
        return false;
    }

    public function getDollarsToFreeShip() {
        if ($this->_dollarsToFreeShip === null) {
            $freeShipBorder = Mage::getStoreConfig('carriers/freeshipping/free_shipping_subtotal');
            $freeShipBorder = Mage::helper('core')->currency($freeShipBorder, false, false);
            $currency = Mage::app()->getStore()->getCurrentCurrencyCode();
            $totals = $this->_getTotals();
            $subtotal = 0;

            if (isset($totals['subtotal'])) {
                $subtotal = $totals['subtotal']->getValue();
            } else {
                // in the unlikely event subtotal is not set?
                $subtotal = $this->getQuote()->getSubtotalWithDiscount();
            }

            $this->_dollarsToFreeShip = $freeShipBorder - $subtotal;
        }
        return round($this->_dollarsToFreeShip, 2);
    }

    public function getGrandTotal() {
        return $this->_getQuote()->getStore()->formatPrice($this->_getQuote()->getGrandTotal(), false);
    }


    /**
     * Prepare the named total array for return.
     *
     * @param $code
     * @param $title
     * @param $value
     * @param array $additional
     * @return array
     */
    protected function _prepareTotal($code, $title, $value, $additional=array()) {
        $return = [
            'code' => $code,
            'title' => $title,
            'value' => $this->_getQuote()->getStore()->formatPrice($value, false),
        ];

        foreach($additional as $key=>$value) {
            $return[$key] = $value;
        }
        return $return;
    }

    /**
     * Get the totals render block for access to logic functions.
     *
     * @param $code
     * @return string
     */
    protected function _getTotalBlockRenderer($code)
    {
        $blockName = $code.'_total_renderer';
        $block = Mage::getSingleton('core/layout')->getBlock($blockName);
        if (!$block) {
            $block = $this->_defaultRenderer;
            $config = Mage::getConfig()->getNode("global/sales/quote/totals/{$code}/renderer");
            if ($config) {
                $block = (string) $config;
            }

            $block = Mage::getSingleton('core/layout')->createBlock($block, $blockName);
        }
        $block->setTotals($this->_getTotals());
        return $block;
    }
}
