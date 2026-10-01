import { closePanel, openPanel, syncPanelFromUrl, togglePanel, usePanelStore } from './panel-store';

const panelParam = () => new URL(window.location.href).searchParams.get('panel');

describe('panel store', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    usePanelStore.setState({ active: null });
  });

  it('opens a panel and mirrors it in ?panel=', () => {
    openPanel('tasks');
    expect(usePanelStore.getState().active).toBe('tasks');
    expect(panelParam()).toBe('tasks');
  });

  it('pushes one history entry when opening and steps back when closing', () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const before = window.history.length;
    openPanel('tasks');
    openPanel('stats'); // switching replaces, it does not stack
    expect(window.history.length).toBe(before + 1);
    expect(panelParam()).toBe('stats');
    closePanel();
    expect(back).toHaveBeenCalledTimes(1);
    expect(usePanelStore.getState().active).toBeNull();
    back.mockRestore();
  });

  it('closes a deep-linked panel by dropping the param instead of leaving the site', () => {
    const back = vi.spyOn(window.history, 'back');
    window.history.replaceState(null, '', '/?panel=settings&utm=x');
    syncPanelFromUrl();
    expect(usePanelStore.getState().active).toBe('settings');
    closePanel();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.search).toBe('?utm=x');
    back.mockRestore();
  });

  it('ignores unknown panel ids and toggles', () => {
    window.history.replaceState(null, '', '/?panel=nope');
    syncPanelFromUrl();
    expect(usePanelStore.getState().active).toBeNull();
    togglePanel('sound');
    expect(usePanelStore.getState().active).toBe('sound');
    vi.spyOn(window.history, 'back').mockImplementation(() => {});
    togglePanel('sound');
    expect(usePanelStore.getState().active).toBeNull();
  });
});
