declare module 'hash.js' {
  declare interface BlockHash<T> {
    hmacStrength: number;
    padLength: number;
    endian: 'big' | 'little';
  }

  declare interface MessageDigest<T> {
    blockSize: number;
    outSize: number;
    update(msg: any, enc?: 'hex'): T;
    digest(): number[];
    digest(enc: 'hex'): string;
  }

  declare interface Hash {
    hmac: HmacConstructor;
    ripemd: RipemdSet;
    ripemd160: Ripemd160Constructor;
    sha: ShaSet;
    sha1: Sha1Constructor;
    sha224: Sha224Constructor;
    sha256: Sha256Constructor;
    sha384: Sha384Constructor;
    sha512: Sha512Constructor;
    utils: Utils;
  }

  declare interface Utils {
    toArray(msg: any, enc: 'hex'): Array<number>;
    toHex(msg: any): string;
  }

  declare interface RipemdSet {
    ripemd160: Ripemd160Constructor;
  }

  declare interface ShaSet {
    sha1: Sha1Constructor;
    sha224: Sha224Constructor;
    sha256: Sha256Constructor;
    sha384: Sha384Constructor;
    sha512: Sha512Constructor;
  }

  declare interface HmacConstructor { (hash: BlockHash<any>, key: any, enc?: 'hex'): Hmac }
  declare interface Ripemd160Constructor { (): Ripemd160 }
  declare interface Sha1Constructor { (): Sha1; }
  declare interface Sha224Constructor { (): Sha224; }
  declare interface Sha256Constructor { (): Sha256; }
  declare interface Sha384Constructor { (): Sha384; }
  declare interface Sha512Constructor { (): Sha512; }

  declare interface Hmac extends MessageDigest<Hmac> {
  }

  declare interface Ripemd160 extends BlockHash<Ripemd160>, MessageDigest<Ripemd160> {
  }

  declare interface Sha1 extends BlockHash<Sha1>, MessageDigest<Sha1> {
  }
  declare interface Sha224 extends BlockHash<Sha224>, MessageDigest<Sha224> {
  }
  declare interface Sha256 extends BlockHash<Sha256>, MessageDigest<Sha256> {
  }
  declare interface Sha384 extends BlockHash<Sha384>, MessageDigest<Sha384> {
  }
  declare interface Sha512 extends BlockHash<Sha512>, MessageDigest<Sha512> {
  }

  declare export default Hash;
}
