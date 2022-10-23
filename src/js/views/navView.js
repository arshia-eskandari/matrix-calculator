class NavView {
    _parentElement = document.querySelector('nav ul');
    _listEls = document.querySelectorAll('nav ul li a');
    _active = document.querySelector('.active');

    activeLinkEvent() {
        this._parentElement.addEventListener(
            'click',
            this._activeLinkEventHandler.bind(this)
        );
    }

    _activeLinkEventHandler(e) {
        let navLink = e.target.closest('a');
        if (!navLink) return;
        if (this._active === navLink) return;
        if (this._active) this._active.classList.remove('active');
        navLink.classList.add('active');
        this._active = navLink;
    }

    changeActiveClass(newlink) {
        if (this._active) this._active.classList.remove('active');
        this._active = [...this._listEls].find(
            a => a.href.split('#').at(-1) === newlink.slice(1)
        );
        this._active.classList.add('active');
    }

    addHandlerRender(handler) {
        document.querySelector('nav').addEventListener('click', handler);
    }
}

export default new NavView();
