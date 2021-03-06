const rp = require('request-promise-native');
class PerksInventory {
  constructor(summoner) {
    this._summoner = summoner;
  }

  async getCount() {
    if (!this._pageCount) this._pageCount = JSON.parse(await rp(Mana.base + 'lol-perks/v1/inventory')).ownedPageCount;
    return this._pageCount;
  }

  async setCurrentPage(id) {
    return await rp({
      method: 'PUT',
      uri: Mana.base + 'lol-perks/v1/currentpage',
      body: { id },
      json: true
    });
  }

  async updatePerksPages(pages) {
    const perks = log.dir(3, await this.getPerks());
    let count = await this.getCount();

    if (this._summoner.getSummonerLevel() < 8) return UI.error('runes-safeguard-level-error');
    if (!pages || pages.length === 0 || pages.find(x => x.selectedPerkIds.length === 0) !== undefined) return UI.error('runes-empty-error');

    log.log(2, `[PerksInventory] Loading`);

    count = count > Mana.store.get('runes-max') ? Mana.store.get('runes-max') : count;
    count = count > pages.length ? pages.length : count;

    pages = pages.slice(0, count);

    for (let i = 0; i < count; i++) {
      if (perks[i] && Mana.store.get('runes-delete-method') && (perks[i].selectedPerkIds !== pages[i].selectedPerkIds || perks[i].name !== pages[i].name))
        perks[i] = await this.deletePerkPage(perks[i], i);

      if (!perks[i]) {
        perks[i] = await this.createPerkPage(Object.assign(pages[i], { current: count < 1 }));
      }
      else if (perks[i].selectedPerkIds !== pages[i].selectedPerkIds || perks[i].name !== pages[i].name) {
        const data = Object.assign(perks[i], pages[i], { current: count < 1 });
        perks[i] = await this.updatePerkPage(data);
      }
    }
  }

  async getPerks() {
    if (!this._perks) this._perks = JSON.parse(await rp(Mana.base + 'lol-perks/v1/pages')).filter(page => page.isEditable);
    return this._perks;
  }

  async updatePerkPage(x) {
    return await rp({
      method: 'PUT',
      uri: Mana.base + `lol-perks/v1/pages/${x.id}`,
      body: log.dir(3, x),
      json: true
    });
  }

  async createPerkPage(x) {
    return await rp({
      method: 'POST',
      uri: Mana.base + 'lol-perks/v1/pages',
      body: log.dir(3, x),
      json: true
    });
  }

  async deletePerkPage(page) {
    await rp.del(Mana.base + 'lol-perks/v1/pages/' + page.id);
    return null;
  }

  async deletePerkPages() {
    await rp.del(Mana.base + 'lol-perks/v1/pages');
    this._perks = [];
  }
}

module.exports = PerksInventory;
