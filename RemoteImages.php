<?php


class RemoteImages extends WireArray{

    protected $page;


    /**
     * Per the WireArray interface, items must be of type RemoteImage
     *
     */
    public function isValidItem($item) {
        return $item instanceof RemoteImage;
    }

    /**
     * Get a blank copy of an item of the type that this WireArray holds
     *
     * @throws WireException
     * @return mixed
     *
     */
    public function makeBlankItem() {
        return new RemoteImage();
    }

    public function setPage(Page $page) {
        $this->page = $page;
    }



}