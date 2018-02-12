import { AdvancedTreePage } from './app.po';

describe('AdvancedTree App', () => {
  let page: AdvancedTreePage;

  beforeEach(() => {
    page = new AdvancedTreePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
