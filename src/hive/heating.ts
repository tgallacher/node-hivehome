import { Products } from './products';

export class Heating extends Products {
  public async get() {
    const products = await super.get();

    return products.filter(p => p.type === 'heating');
  }

  // public async history(id: string) {
  // https://beekeeper-uk.hivehome.com/1.0/history/heating/<id>?
  // start=<unix>
  // &end=<unix>
  // &timeUnit=<MINUTES|DAYS|MONTHS>
  // &rate=<interval>
  // &operation=<AVG|MIN|MAX>
  // }
}
