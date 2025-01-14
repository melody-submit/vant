import Popup from '..';
import { mount, triggerDrag, later } from '../../../test';

let wrapper;
afterEach(() => {
  wrapper.unmount();
});

test('lazy render', () => {
  wrapper = mount(Popup);
  expect(wrapper.vm.$el.tagName).toBeFalsy();
  wrapper.vm.value = true;
  expect(wrapper.vm.$el.tagName).toBeTruthy();
});

test('reset z-index', () => {
  wrapper = mount(Popup, {
    props: {
      value: true,
      zIndex: 10,
      lockScroll: false,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('popup lock scroll', () => {
  const wrapper1 = mount(Popup, {
    props: {
      value: true,
    },
  });
  expect(document.body.classList.contains('van-overflow-hidden')).toBeTruthy();
  triggerDrag(document, 0, 100);
  triggerDrag(document, 0, -150);

  const wrapper2 = mount(Popup, {
    props: {
      value: true,
    },
  });
  wrapper1.vm.$unmount();
  expect(document.body.classList.contains('van-overflow-hidden')).toBeTruthy();

  wrapper2.vm.$unmount();
  expect(document.body.classList.contains('van-overflow-hidden')).toBeFalsy();
});

test('get container with parent', () => {
  const div1 = document.createElement('div');
  const div2 = document.createElement('div');
  wrapper = mount({
    template: `
      <div>
        <popup :value="true" :teleport="teleport" />
      </div>
    `,
    components: {
      Popup,
    },
    data() {
      return {
        teleport: div1,
      };
    },
  });
  const popup = wrapper.find('.van-popup').element;

  expect(popup.parentNode).toEqual(div1);
  wrapper.vm.teleport = () => div2;
  expect(popup.parentNode).toEqual(div2);
  wrapper.vm.teleport = null;
  expect(popup.parentNode).toEqual(wrapper.element);
});

test('get container with selector', () => {
  wrapper = mount({
    template: `
      <div>
        <popup class="teleport-selector-1" :value="true" teleport="body"></popup>
        <popup class="teleport-selector-2" :value="true" teleport="unknown"></popup>
      </div>
    `,
    components: {
      Popup,
    },
  });

  const dom1 = document.querySelector('.teleport-selector-1');
  const dom2 = wrapper.vm.$el.querySelector('.teleport-selector-2');

  expect(dom1.parentNode).toEqual(document.body);
  expect(dom2.parentNode).toEqual(wrapper.vm.$el);
});

test('render overlay', async () => {
  const div = document.createElement('div');
  wrapper = mount({
    template: `
      <div>
        <popup :value="true" :teleport="teleport" />
      </div>
    `,
    components: {
      Popup,
    },
    data() {
      return {
        teleport: () => div,
      };
    },
  });

  await later();

  expect(div.querySelector('.van-overlay')).toBeTruthy();
});

test('watch overlay prop', async () => {
  const div = document.createElement('div');
  wrapper = mount({
    template: `
      <div>
        <popup :value="show" :overlay="overlay" :teleport="teleport" />
      </div>
    `,
    components: {
      Popup,
    },
    data() {
      return {
        show: false,
        overlay: false,
        teleport: () => div,
      };
    },
  });

  await later();
  expect(div.querySelector('.van-overlay')).toBeFalsy();

  wrapper.setData({ overlay: true });
  await later();
  expect(div.querySelector('.van-overlay')).toBeFalsy();

  wrapper.setData({ show: true });
  await later();
  expect(div.querySelector('.van-overlay')).toBeTruthy();
});

test('close on click overlay', async () => {
  const div = document.createElement('div');
  const onClickOverlay = jest.fn();

  wrapper = mount({
    template: `
      <div>
        <popup
          v-model="value"
          :teleport="teleport"
          @click-overlay="onClickOverlay"
        />
      </div>
    `,
    components: {
      Popup,
    },
    data() {
      return {
        value: true,
        teleport: () => div,
      };
    },
    methods: {
      onClickOverlay,
    },
  });

  await later();

  const modal = div.querySelector('.van-overlay');
  triggerDrag(modal, 0, -30);
  modal.click();

  expect(wrapper.vm.value).toBeFalsy();
  expect(onClickOverlay).toHaveBeenCalledTimes(1);
});

test('open & close event', () => {
  const wrapper = mount(Popup);
  wrapper.vm.value = true;
  expect(wrapper.emitted('open')).toBeTruthy();
  wrapper.vm.value = false;
  expect(wrapper.emitted('close')).toBeTruthy();
});

test('click event', () => {
  const wrapper = mount(Popup, {
    props: {
      value: true,
    },
  });

  wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeTruthy();
});

test('duration prop when position is center', () => {
  const wrapper = mount(Popup, {
    props: {
      value: true,
      duration: 0.5,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('duration prop when position is top', () => {
  const wrapper = mount(Popup, {
    props: {
      value: true,
      duration: 0.5,
      position: 'top',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('round prop', () => {
  const wrapper = mount(Popup, {
    props: {
      value: true,
      round: true,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('closeable prop', () => {
  const wrapper = mount(Popup, {
    props: {
      value: true,
      closeable: true,
    },
  });

  wrapper.find('.van-popup__close-icon').trigger('click');
  expect(wrapper.emitted('input')[0][0]).toEqual(false);
});

test('should emit click-close-icon event when close icon is clicked', () => {
  const wrapper = mount(Popup, {
    propsData: {
      value: true,
      closeable: true,
    },
  });

  wrapper.find('.van-popup__close-icon').trigger('click');
  expect(wrapper.emitted('click-close-icon').length).toEqual(1);
});

test('close-icon prop', () => {
  const wrapper = mount(Popup, {
    props: {
      value: true,
      closeable: true,
      closeIcon: 'success',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});
