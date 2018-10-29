// 1. createElement Stub

const TinyReact = (function () {
    function createElement(type, attributes = {}, ...children) {
        const childElements = [].concat(...children).reduce((acc, child) => {
            if (child !== null && child !== false && child !== true) {
                child instanceof Object ? acc.push(child)
                    : acc.push(createElement("text", { textContent: child }));
            }

            return acc;

        }, [])

        return {
            type,
            children: childElements,
            props: Object.assign({ children: childElements }, attributes)
        }
    }


    const render = (vdom, container, oldDom = container.firstChild) => {

        diff(vdom, container, oldDom);
        // if (!oldDom) {
        //     mountElement(vdom, container, oldDom);
        // }
    }

    const diff = function (vdom, container, oldDom) {
        let oldvdom = oldDom && oldDom._virtualElement;
        let oldComponent = oldvdom && oldvdom.component;

        if (!oldDom) {
            mountElement(vdom, container, oldDom)
        }
        else if (typeof vdom.type === "function") {
            diffComponent(vdom, oldComponent, container, oldDom);
        }
        else if (oldvdom && oldvdom.type === vdom.type) {
            if (vdom.type === "text") {
                updateTextNode(oldDom, vdom, oldvdom);
            }
            else {
                updateDomElement(oldDom, vdom, oldvdom);
            }

            oldDom._virtualElement = vdom;

            vdom.children.forEach((child, indx) => {
                diff(child, oldDom, oldDom.childNodes[indx])
            });


            let oldNodes = oldDom.childNodes;

            if (oldNodes.length > vdom.children.length) {
                for (let i = 0; i < oldNodes.length; i++) {
                    if (i >= vdom.children.length) {
                        let nodeToRemoved = oldNodes[i];
                        unmounteNode(nodeToRemoved, oldDom);
                    }
                }
            }
        }



    }

    const diffComponent = function (newVirtualElement, oldComponent, container, oldDom) {


        if (isSameComponentType(oldComponent, newVirtualElement)) {
            updateComponent(newVirtualElement, oldComponent, container, oldDom);
        }
        if (!oldComponent) {
            mountElement(newVirtualElement, container, oldDom);
        }
    }

    const updateComponent = function (newVirtualElement, oldComponent, container, oldDom) {
        oldComponent.componentWillReceiveProps(newVirtualElement.props);

        if (oldComponent.componetShouldUpdate(newVirtualElement.props)) {


            let prevProps = oldComponent.props;

            oldComponent.componentWillUpdate(newVirtualElement.props, oldComponent.state);
            oldComponent.updateProps(newVirtualElement.props);

            let newEle = oldComponent.render();
            newEle.component = oldComponent;

            diff(newEle, container, oldDom, oldComponent);

            oldComponent.componentDidUpdate(prevProps, )

        }
    }

    const unmounteNode = function (domElement, parentComponent) {
        let virtualEle = domElement._virtualElement;
        if (!virtualEle) {
            domElement.remove();
            return;
        }

        if (virtualEle.props && virtualEle.props.ref) {
            virtualEle.props.ref(null);
        }


    }

    const updateTextNode = function (domElement, newVirtualElement, oldVirtualElement) {
        if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
            domElement.textContent = newVirtualElement.props.textContent
        }

        domElement._virtualElement = newVirtualElement;
    }



    const mountElement = (vdom, container, oldDom) => {

        if (isFunction(vdom)) {
            return mountComponent(vdom, container, oldDom);
        }
        return mountSimpleNode(vdom, container, oldDom);
    }

    const isFunction = function (vdom) {
        return vdom && typeof vdom.type === "function";
    }

    const isFunctionalComponent = function (vdom) {
        let nodeType = vdom && vdom.type;

        return nodeType && isFunction(vdom) && !(nodeType.prototype && nodeType.prototype.render);
    }

    const isSameComponentType = function (oldComponent, newVirtualElement) {
        return oldComponent && newVirtualElement.type === oldComponent.constructor;
    }

    const buildFunctionalComponent = function (vdom) {
        return vdom.type(vdom.props || {});
    }

    const buildStatefulComponent = function (newVirtualEle) {
        let component = new newVirtualEle.type(newVirtualEle.props);

        let newElement = component.render();

        newElement.component = component;

        return newElement;
    }

    const mountSimpleNode = (vdom, container, oldDomElement, parentElement) => {
        let newDomElement = null;
        let nextSibling = oldDomElement && oldDomElement.nextSibling;

        if (vdom.type === "text") {
            newDomElement = document.createTextNode(vdom.props.textContent);
        }
        else {
            newDomElement = document.createElement(vdom.type);
            updateDomElement(newDomElement, vdom);
        }

        newDomElement._virtualElement = vdom;


        if (oldDomElement) {
            unmounteNode(oldDomElement, parentElement);
        }

        if (nextSibling) {
            container.insertBefore(newDomElement, nextSibling);
        }
        else {
            container.appendChild(newDomElement);
        }

        let component = vdom.component;
        if (component) {
            component.setDom(newDomElement);
        }



        vdom.children.map((child) => {
            mountElement(child, newDomElement);
        });

        if (vdom.props && vdom.props.ref) {
            vdom.props.ref(newDomElement);
        }
    }

    const mountComponent = function (vdom, container, oldDom) {
        let nextVdom = null, newDomElement = null, component = null;
        if (isFunctionalComponent(vdom)) {
            nextVdom = buildFunctionalComponent(vdom);
        }
        else {
            nextVdom = buildStatefulComponent(vdom);
        }


        if (isFunction(nextVdom)) {
            return mountComponent(nextVdom, container, oldDom)
        }
        else {
            newDomElement = mountElement(nextVdom, container, oldDom)
        }

        component = nextVdom.component;

        if (component.props && component.props.ref) {

            component.componentDidMount();

            component.props.ref(component);
        }

        return newDomElement;
    }

    const updateDomElement = (newDomElement, newVirtualElement, oldVirtualElement = {}) => {
        let newProps = newVirtualElement.props || {};
        let oldProps = oldVirtualElement.props || {};

        Object.keys(newProps).forEach((propName) => {
            let newProp = newProps[propName];
            let oldProp = oldProps[propName];

            if (newProp !== oldProp) {
                if (propName.slice(0, 2).toLowerCase() === "on") {
                    let eventName = propName.slice(2).toLowerCase();
                    newDomElement.addEventListener(eventName, newProp, false);

                    if (oldProp) {
                        newDomElement.removeEventListener(eventName, oldProp, false);
                    }
                }

                else if (propName === "value" || propName === "checked") {
                    newDomElement[propName] = newProp;
                }

                else if (propName !== "children") {
                    if (propName === "className") {
                        newDomElement.setAttribute("class", newProp)
                    }
                    else {
                        newDomElement.setAttribute(propName, newProp);
                    }

                }
            }
        })

        Object.keys(oldProps).forEach((propName) => {

            let newProp = newProps[propName];
            let oldProp = oldProps[propName];

            if (!newProp) {
                if (propName.slice(0, 2).toLowerCase() === "on") {
                    newDomElement.removeEventListener(propName, oldProp, false)
                }
                else {
                    newDomElement.removeAttribute(propName);
                }
            }
        })


    }

    class Component {
        constructor(props) {
            this.props = props;
            this.state = {};
            this.prevState = {}
        }

        setState(nextState) {
            if (!this.prevState) {
                this.prevState = this.state;
            }

            this.state = Object.assign({}, this.state, nextState);

            let dom = this.getDom();
            let container = dom.parentNode;

            let vdom = this.render();

            diff(vdom, container, dom);

        }

        setDom(dom) {
            this._dom = dom;
        }

        getDom() {
            return this._dom;
        }

        updateProps(newProps) {
            this.props = newProps;
        }

        componentWillMount() {

        }

        componentDidMount() {

        }

        componentWillReceiveProps(nextProps) {

        }

        componetShouldUpdate(nextState, nextProps) {
            return this.prevState !== nextState || this.props !== nextProps;
        }

        componentWillUpdate(nextProps, nextState) { }

        componentDidUpdate(prevProps, prevState) { }

        componentWillUnmount() { }
    }

    return {
        createElement,
        render,
        Component
    }
}());