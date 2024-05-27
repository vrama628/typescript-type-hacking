type LC = ["var", string] | ["app", [LC, LC]] | ["lam", [string, LC]];

type Subst<V extends string, T extends LC, E extends LC> = T extends ["var", V]
  ? E
  : T extends ["var", string]
  ? T
  : T extends ["app", [infer A extends LC, infer B extends LC]]
  ? ["app", [Subst<V, A, E>, Subst<V, B, E>]]
  : T extends ["lam", [V, LC]]
  ? T
  : T extends ["lam", [infer X extends string, infer TT extends LC]]
  ? ["lam", [X, Subst<V, TT, E>]]
  : never;

type Eval<E extends LC> = E extends [
  "app",
  [infer A extends LC, infer B extends LC]
]
  ? Eval<A> extends ["lam", [infer X extends string, infer C extends LC]]
    ? // @ts-ignore
      Eval<Subst<X, C, Eval<B>>>
    : E
  : E;

type Term1 = ["app", [["lam", ["x", ["var", "x"]]], ["var", "y"]]];
type Result1 = Eval<Term1>;

// Church numerals
type ApplyNTimes<
  F extends LC,
  E extends LC,
  N extends number,
  ACC extends unknown[] = []
> = ACC["length"] extends N
  ? E
  : ApplyNTimes<F, ["app", [F, E]], N, [...ACC, unknown]>;
type ChurchEncode<N extends number> = [
  "lam",
  ["f", ["lam", ["x", ApplyNTimes<["var", "f"], ["var", "x"], N>]]]
];
type Zero = ChurchEncode<0>;
type One = ChurchEncode<1>;

type ChurchDecodeHelp<E extends LC> = E extends [
  "app",
  [["var", "S"], infer EE extends LC]
]
  ? [...ChurchDecodeHelp<EE>, unknown]
  : [];
// @ts-ignore
type ChurchDecode<E extends LC> = ChurchDecodeHelp<
  Eval<["app", [["app", [E, ["var", "S"]]], ["var", "Z"]]]>
>["length"];

type Plus<A extends LC, B extends LC> = [
  "lam",
  [
    "f",
    [
      "lam",
      [
        "x",
        [
          "app",
          [
            ["app", [A, ["var", "f"]]],
            ["app", [["app", [B, ["var", "f"]]], ["var", "x"]]]
          ]
        ]
      ]
    ]
  ]
];

type Times<A extends LC, B extends LC> = [
  "lam",
  [
    "f",
    [
      "lam",
      ["x", ["app", [["app", [A, ["app", [B, ["var", "f"]]]]], ["var", "x"]]]]
    ]
  ]
];

// Hover over these inferred types
type Thirteen = ChurchDecode<Plus<ChurchEncode<5>, ChurchEncode<8>>>;
type Forty = ChurchDecode<Times<ChurchEncode<5>, ChurchEncode<8>>>;
