define("theme_mentor/drawers", ["exports", "core/modal_backdrop", "core/templates", "core/aria", "core/event_dispatcher", "core/utils", "core/pending", "jquery",
    'core/local/aria/focuslock',], (function (_exports, _modal_backdrop, _templates, Aria, _event_dispatcher, _utils, _pending, _jquery, FocusLock) {
    function _getRequireWildcardCache(nodeInterop) {
        if ("function" != typeof WeakMap) return null;
        var cacheBabelInterop = new WeakMap,
            cacheNodeInterop = new WeakMap;
        return (_getRequireWildcardCache = function(nodeInterop) {
            return nodeInterop ? cacheNodeInterop : cacheBabelInterop
        })(nodeInterop)
    }

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        }
    }

    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj
    }
    Object.defineProperty(_exports, "__esModule", {
        value: !0
    }), _exports.default = void 0, _modal_backdrop = _interopRequireDefault(_modal_backdrop), _templates = _interopRequireDefault(_templates), Aria = function(obj, nodeInterop) {
        if (!nodeInterop && obj && obj.__esModule) return obj;
        if (null === obj || "object" != typeof obj && "function" != typeof obj) return {
            default: obj
        };
        var cache = _getRequireWildcardCache(nodeInterop);
        if (cache && cache.has(obj)) return cache.get(obj);
        var newObj = {},
            hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var key in obj)
            if ("default" !== key && Object.prototype.hasOwnProperty.call(obj, key)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
                desc && (desc.get || desc.set) ? Object.defineProperty(newObj, key, desc) : newObj[key] = obj[key]
            } newObj.default = obj, cache && cache.set(obj, newObj);
        return newObj
    }(Aria), _pending = _interopRequireDefault(_pending), _jquery = _interopRequireDefault(_jquery);
    let backdropPromise = null;
    const drawerMap = new Map,
        SELECTORS_BUTTONS = '[data-toggler="drawers"]',
        SELECTORS_CLOSEBTN = '[data-toggler="drawers"][data-action="closedrawer"]',
        SELECTORS_OPENBTN = '[data-toggler="drawers"][data-action="opendrawer"]',
        SELECTORS_TOGGLEBTN = '[data-toggler="drawers"][data-action="toggle"]',
        SELECTORS_DRAWERS = '[data-region="fixed-drawer"]',
        SELECTORS_CONTAINER = "#page.drawers",
        SELECTORS_DRAWERCONTENT = ".drawercontent",
        CLASSES_SCROLLED = "scrolled",
        CLASSES_SHOW = "show",
        CLASSES_NOTINITIALISED = "not-initialized",
        CLASSES_TOGGLERIGHT = ".drawer-right-toggle",
        sizes_medium = 1247,
        sizes_large = 1400,
        getCurrentWidth = () => {
            const DomRect = document.body.getBoundingClientRect();
            return DomRect.x + DomRect.width
        },
        isSmall = () => getCurrentWidth() < sizes_medium,
        getBackdrop = () => (backdropPromise || (backdropPromise = _templates.default.render("core/modal_backdrop", {}).then((html => new _modal_backdrop.default(html))).then((modalBackdrop => (modalBackdrop.getAttachmentPoint().get(0).addEventListener("click", (e => {
            e.preventDefault(), Drawers.closeAllDrawers()
        })), modalBackdrop))).catch()), backdropPromise),
        getDrawerOpenButton = drawerId => {
            let openButton = document.querySelector("".concat(SELECTORS_OPENBTN, '[data-target="').concat(drawerId, '"]'));
            return openButton || (openButton = document.querySelector("".concat(SELECTORS_TOGGLEBTN, '[data-target="').concat(drawerId, '"]'))), openButton
        },
        disableDrawerTooltips = drawerNode => {
            [drawerNode.querySelector(SELECTORS_CLOSEBTN), getDrawerOpenButton(drawerNode.id)].forEach((button => {
                button && disableButtonTooltip(button)
            }))
        },
        disableButtonTooltip = (button, enableOnBlur) => {
            button.hasAttribute("data-original-title") ? ((0, _jquery.default)(button).tooltip("disable"), button.setAttribute("title", button.dataset.originalTitle)) : (button.dataset.disabledToggle = button.dataset.toggle, button.removeAttribute("data-toggle")), enableOnBlur && (button.dataset.restoreTooltipOnBlur = !0)
        },
        enableButtonTooltip = button => {
            button.hasAttribute("data-original-title") ? ((0, _jquery.default)(button).tooltip("enable"), button.removeAttribute("title")) : button.dataset.disabledToggle && (button.dataset.toggle = button.dataset.disabledToggle, (0, _jquery.default)(button).tooltip()), delete button.dataset.restoreTooltipOnBlur
        };
    class Drawers {
        constructor(drawerNode) {
            _defineProperty(this, "drawerNode", null), this.drawerNode = drawerNode, isSmall() && this.closeDrawer({
                focusOnOpenButton: !1,
                updatePreferences: !1
            }), this.drawerNode.classList.contains(CLASSES_SHOW) ? this.openDrawer({
                focusOnCloseButton: !1
            }) : 1 == this.drawerNode.dataset.forceopen ? isSmall() || this.openDrawer({
                focusOnCloseButton: !1
            }) : Aria.hide(this.drawerNode), isSmall() && disableDrawerTooltips(this.drawerNode), (drawerNode => {
                const content = drawerNode.querySelector(SELECTORS_DRAWERCONTENT);
                content && content.addEventListener("scroll", (() => {
                    drawerNode.classList.toggle(CLASSES_SCROLLED, 0 != content.scrollTop)
                }))
            })(this.drawerNode), drawerMap.set(drawerNode, this), drawerNode.classList.remove(CLASSES_NOTINITIALISED)
        }
        get isOpen() {
            return this.drawerNode.classList.contains(CLASSES_SHOW)
        }
        get closeOnResize() {
            return !!parseInt(this.drawerNode.dataset.closeOnResize)
        }
        static getDrawerInstanceForNode(drawerNode) {
            return drawerMap.has(drawerNode) || new Drawers(drawerNode), drawerMap.get(drawerNode)
        }
        dispatchEvent(eventname) {
            let cancelable = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            return (0, _event_dispatcher.dispatchEvent)(eventname, {
                drawerInstance: this
            }, this.drawerNode, {
                cancelable: cancelable
            })
        }
        openDrawer() {
            var _this$drawerNode$quer;
            let {
                focusOnCloseButton: focusOnCloseButton = !0
            } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            const pendingPromise = new _pending.default("theme_mentor/drawers:open");
            if (this.dispatchEvent(Drawers.eventTypes.drawerShow, !0).defaultPrevented) return;
            null === (_this$drawerNode$quer = this.drawerNode.querySelector(SELECTORS_CLOSEBTN)) || void 0 === _this$drawerNode$quer || _this$drawerNode$quer.classList.toggle("hidden", !0);
            let openButton = getDrawerOpenButton(this.drawerNode.id);
            var _jQuery;
            openButton && openButton.hasAttribute("data-original-title") && (null === (_jQuery = (0, _jquery.default)(openButton)) || void 0 === _jQuery || _jQuery.tooltip("hide"));
            Aria.unhide(this.drawerNode), this.drawerNode.classList.add(CLASSES_SHOW);
            const preference = this.drawerNode.dataset.preference;
            preference && !isSmall() && 1 != this.drawerNode.dataset.forceopen && M.util.set_user_preference(preference, !0);
            const state = this.drawerNode.dataset.state;
            if (state) {
                document.getElementById("page").classList.add(state)
            }
            isSmall() && getBackdrop().then((backdrop => {
                backdrop.show();
                FocusLock.trapFocus(this.drawerNode);
                return document.getElementById("page").style.overflow = "hidden", backdrop
            })).catch();
            const closeButton = this.drawerNode.querySelector(SELECTORS_CLOSEBTN);
            focusOnCloseButton && closeButton && disableButtonTooltip(closeButton, !0), setTimeout((() => {
                closeButton.classList.toggle("hidden", !1), focusOnCloseButton && closeButton.focus(), pendingPromise.resolve()
            }), 300), this.dispatchEvent(Drawers.eventTypes.drawerShown)
        }
        closeDrawer() {
            let {
                focusOnOpenButton: focusOnOpenButton = !0,
                updatePreferences: updatePreferences = !0
            } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            const pendingPromise = new _pending.default("theme_mentor/drawers:close");
            if (this.dispatchEvent(Drawers.eventTypes.drawerHide, !0).defaultPrevented) return;
            const closeButton = this.drawerNode.querySelector(SELECTORS_CLOSEBTN);
            var _jQuery2;
            if (isSmall()) {
                FocusLock.untrapFocus();
            }
            (null == closeButton || closeButton.classList.toggle("hidden", !0), closeButton.hasAttribute("data-original-title")) && (null === (_jQuery2 = (0, _jquery.default)(closeButton)) || void 0 === _jQuery2 || _jQuery2.tooltip("hide"));
            const preference = this.drawerNode.dataset.preference;
            preference && updatePreferences && !isSmall() && M.util.set_user_preference(preference, !1);
            const state = this.drawerNode.dataset.state;
            if (state) {
                document.getElementById("page").classList.remove(state)
            }
            Aria.hide(this.drawerNode), this.drawerNode.classList.remove(CLASSES_SHOW), getBackdrop().then((backdrop => {
                if (backdrop.hide(), isSmall()) {
                    document.getElementById("page").style.overflow = "auto"
                }
                return backdrop
            })).catch();
            let openButton = getDrawerOpenButton(this.drawerNode.id);
            openButton && disableButtonTooltip(openButton, !0), setTimeout((() => {
                openButton && focusOnOpenButton && openButton.focus(), pendingPromise.resolve()
            }), 300), this.dispatchEvent(Drawers.eventTypes.drawerHidden)
        }
        toggleVisibility() {
            this.drawerNode.classList.contains(CLASSES_SHOW) ? this.closeDrawer() : this.openDrawer()
        }
        static closeAllDrawers() {
            drawerMap.forEach((drawerInstance => {
                drawerInstance.closeDrawer()
            }))
        }
        static closeOtherDrawers(comparisonInstance) {
            drawerMap.forEach((drawerInstance => {
                drawerInstance !== comparisonInstance && drawerInstance.closeDrawer()
            }))
        }
    }
    _exports.default = Drawers, _defineProperty(Drawers, "eventTypes", {
        drawerShow: "theme_mentor/drawers:show",
        drawerShown: "theme_mentor/drawers:shown",
        drawerHide: "theme_mentor/drawers:hide",
        drawerHidden: "theme_mentor/drawers:hidden"
    });
    const scrollbarVisible = htmlNode => htmlNode.scrollHeight > htmlNode.clientHeight,
        setLastUsedToggle = toggleButton => {
            toggleButton.dataset.target && (document.querySelectorAll("".concat(SELECTORS_BUTTONS, '[data-target="').concat(toggleButton.dataset.target, '"]')).forEach((btn => {
                btn.dataset.lastused = !1
            })), toggleButton.dataset.lastused = !0)
        };
    (() => {
        const body = document.querySelector("body"),
            drawerLayout = document.querySelector(SELECTORS_CONTAINER);
        if (drawerLayout) {
            const drawerRight = document.querySelector(SELECTORS_CONTAINER + " " + CLASSES_TOGGLERIGHT);
            !scrollbarVisible(drawerLayout) && drawerRight && (drawerRight.style.marginRight = "0"), drawerLayout.addEventListener("scroll", (() => {
                drawerLayout.scrollTop >= window.innerHeight ? body.classList.add(CLASSES_SCROLLED) : body.classList.remove(CLASSES_SCROLLED)
            }))
        }
    })(), (() => {
        document.addEventListener("click", (e => {
            const toggleButton = e.target.closest(SELECTORS_TOGGLEBTN);
            if (toggleButton && toggleButton.dataset.target) {
                e.preventDefault();
                const targetDrawer = document.getElementById(toggleButton.dataset.target),
                    drawerInstance = Drawers.getDrawerInstanceForNode(targetDrawer);
                setLastUsedToggle(toggleButton), drawerInstance.toggleVisibility();
                document.getElementById('navbar_responsive_button').setAttribute('aria-expanded', 'true');
            }
            const openDrawerButton = e.target.closest(SELECTORS_OPENBTN);
            if (openDrawerButton && openDrawerButton.dataset.target) {
                e.preventDefault();
                const targetDrawer = document.getElementById(openDrawerButton.dataset.target),
                    drawerInstance = Drawers.getDrawerInstanceForNode(targetDrawer);
                setLastUsedToggle(toggleButton), drawerInstance.openDrawer();
            }
            const closeDrawerButton = e.target.closest(SELECTORS_CLOSEBTN);
            if (closeDrawerButton && closeDrawerButton.dataset.target) {
                e.preventDefault();
                const targetDrawer = document.getElementById(closeDrawerButton.dataset.target);
                document.getElementById('navbar_responsive_button').setAttribute('aria-expanded', 'false');
                Drawers.getDrawerInstanceForNode(targetDrawer).closeDrawer(), (target => {
                    const lastUsedButton = document.querySelector("".concat(SELECTORS_BUTTONS, '[data-target="').concat(target, '"][data-lastused="true"'));
                    lastUsedButton && lastUsedButton.focus();
                })(closeDrawerButton.dataset.target)
            }
        })), document.addEventListener(Drawers.eventTypes.drawerShow, (e => {
            getCurrentWidth() >= sizes_large || Drawers.closeOtherDrawers(e.detail.drawerInstance)
        }));
        const btnSelector = "".concat(SELECTORS_TOGGLEBTN, ", ").concat(SELECTORS_OPENBTN, ", ").concat(SELECTORS_CLOSEBTN);
        document.addEventListener("focusout", (e => {
            const button = e.target.closest(btnSelector);
            void 0 !== (null == button ? void 0 : button.dataset.restoreTooltipOnBlur) && enableButtonTooltip(button)
        }));
        window.addEventListener("resize", (0, _utils.debounce)((() => {
            if (isSmall()) {
                let anyOpen = !1;
                drawerMap.forEach((drawerInstance => {
                    disableDrawerTooltips(drawerInstance.drawerNode), drawerInstance.isOpen && (drawerInstance.closeOnResize ? drawerInstance.closeDrawer() : anyOpen = !0)
                })), anyOpen && getBackdrop().then((backdrop => backdrop.show())).catch()
            } else drawerMap.forEach((drawerInstance => {
                var drawerNode;
                [(drawerNode = drawerInstance.drawerNode).querySelector(SELECTORS_CLOSEBTN), getDrawerOpenButton(drawerNode.id)].forEach((button => {
                    button && enableButtonTooltip(button)
                }))
                FocusLock.untrapFocus();
            })), getBackdrop().then((backdrop => backdrop.hide())).catch()
        }), 400))
    })();
    return document.querySelectorAll(SELECTORS_DRAWERS).forEach((drawerNode => Drawers.getDrawerInstanceForNode(drawerNode))), _exports.default
}));

