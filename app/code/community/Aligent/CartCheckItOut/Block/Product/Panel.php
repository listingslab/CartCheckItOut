<?php

class Aligent_CartCheckItOut_Block_Product_Panel extends Mage_Checkout_Block_Cart_Item_Renderer {

    private $_cartItem = null;
    private $_isLoggedIn = null;

    public function isCart() {
        return ($this->getCart()) ? true : false;
    }

    public function getCartItem() {
        if($this->_cartItem === null) {
            //The item is set in the data as 'Cartproduct'
            $this->_cartItem = $this->getCartproduct();
            $this->setItem($this->_cartItem);
        }
        return $this->_cartItem;
    }


    /**
     * Get list of all otions for product
     *
     * @return array
     */
    public function getOptionList()
    {
        $options = array();
        $item = $this->getCartItem();
        $helper = Mage::helper('catalog/product_configuration');

        if( $item->getProductType() == 'simple' ) {
            return $this->getProductOptions();
        } else if ($item->getProductType() == Mage_Catalog_Model_Product_Type_Configurable::TYPE_CODE) {
            return $helper->getConfigurableOptions($this->getItem());
        }
    }

    public function isLoggedIn() {
        if ($this->_isLoggedIn === null) {
            $this->_isLoggedIn = Mage::getSingleton('customer/session')->isLoggedIn();
        }
        return $this->_isLoggedIn;
    }

    /**
     * Retrieve item messages
     * Return array with keys
     *
     * text => the message text
     * type => type of a message
     *
     * @return array
     */
    public function getMessages()
    {
        $messages = array();
        $quoteItem = $this->getItem();

        // Add basic messages occuring during this page load
        $baseMessages = $quoteItem->getMessage(false);
        if ($baseMessages) {
            foreach ($baseMessages as $message) {
                if (strpos($message,'The requested quantity for') !== false) {
                    $message = $this->__('The requested quantity is not available.');
                }

                $messages[] = array(
                    'text' => $message,
                    'type' => $quoteItem->getHasError() ? 'error' : 'notice'
                );
            }
        }

        // Add messages saved previously in checkout session
        $checkoutSession = $this->getCheckoutSession();
        if ($checkoutSession) {
            /* @var $collection Mage_Core_Model_Message_Collection */
            $collection = $checkoutSession->getQuoteItemMessages($quoteItem->getId(), true);
            if ($collection) {
                $additionalMessages = $collection->getItems();
                foreach ($additionalMessages as $message) {
                    /* @var $message Mage_Core_Model_Message_Abstract */
                    $messages[] = array(
                        'text' => $message->getCode(),
                        'type' => ($message->getType() == Mage_Core_Model_Message::ERROR) ? 'error' : 'notice'
                    );
                }
            }
        }

        return $messages;
    }

}