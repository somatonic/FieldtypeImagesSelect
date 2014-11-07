<?php


class RemoteImage extends WireData {

    protected $imagepage;

    public function __construct() {
        $this->imagepage = null;
        $this->set('id', null); // id of page holding image
        $this->set('image', null);
        $this->set('description', '');

    }

    public function setImagePage(Page $page) {
        $this->imagepage = $page;
    }

    public function setImage(Page $page) {
        $this->set("image", $page->image->first);
    }

    public function setDescription($value) {
        $this->set("description", $value);
    }

    public function description() {
        return $this->description;
    }

    public function __toString(){
        // return $this->image;
        return "<img src='{$this->image->size(0,100)->url}'>";
    }

}